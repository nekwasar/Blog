# Index Mechanism RFC

## Background

Halo currently uses the Extension mechanism to store and retrieve data for extensibility. Since the initial design loads all Extension data into memory for queries, this causes large amounts of irrelevant data to be loaded during paginated or filtered queries. As Halo user data grows, this becomes a significant memory burden. This document proposes an index mechanism to solve data query issues, improving efficiency and reducing memory overhead.

## Goals

- **Improve query efficiency**: Speed up data retrieval. Indexes allow the system to quickly locate data rows, reducing the amount of data that must be read.
- **Reduce network and memory overhead**: Without indexes, all Extension data is transferred over the network and loaded into memory. Indexes pinpoint the exact data needed.
- **Optimize sorting**: Indexes accelerate sorting operations since they are naturally ordered.
- **Extensible index storage**: Indexes improve efficiency but consume extra storage. If they grow too large, disk-based storage can reduce memory usage.

## Non-Goals

- Persistent index storage — initially, indexes are stored in memory only. If they grow too large, disk-based storage can be considered.
- Automatic index maintenance — detecting data changes for index updates is complex; automatic maintenance is not planned for now.
- Index pre-validation — verifying index integrity and correctness on startup is not covered, as indexes are rebuilt on every startup.
- Multi-threaded index building — index construction is single-threaded for now.

## Design

An index is a data structure that provides efficient lookups for fields in a dataset. It maps fields of an Extension to the Extension's name, avoiding full scans during queries.

### Index Structure

Each Extension-declared index is created as a mapping between a keySpace and index info:

```javascript
{
 "/registry/storage.halo.run/groups": [{
  name: "specName",
  spec: {
    indexFunc: function(doc) {
      return doc.spec.name;
    },
    order: 'asc',
    unique: false
  },
  v: 1,
  ready: false
 },
 {
  name: "metadata.labels",
  spec: {
    indexFunc: function(doc) {
       var labels = obj.getMetadata().getLabels();
        if (labels == null) {
          return Set.of();
        }
        return labels.entrySet()
          .stream()
          .map(entry -> entry.getKey() + "=" + entry.getValue())
          .collect(Collectors.toSet());
    },
    order: 'asc',
    unique: false
  },
  v: 1,
  ready: true,
 }]
}
```

- `name`: Index name, unique per Extension (typically a field path like `metadata.name`).
- `spec.indexFunc`: Generates index keys (an array of strings).
- `spec.order`: Sort order (`asc` or `desc`).
- `spec.unique`: Whether this is a unique index (enforces uniqueness checks on insert).
- `v`: Index structure version, used for detecting structural changes that require rebuilding.
- `ready`: Whether the index has been fully built. `false` during construction, `true` when complete. If `false` on next startup (e.g., due to power loss), the index is rebuilt.

Every Extension has a default unique index on `metadata.name`.

### Index Building

Indexes are built by performing a full scan of Extension data.

1. Set `ready` to `false`, locking writes to that Extension.
2. Scan all records in the Extension dataset.
3. For each record, generate key strings based on the index fields. The value is the `metadata.name` for locating the record in the database.
4. Insert generated keys into an external sorter to ensure ordering.
5. Batch-load the sorted keys into the index.
6. Release the write lock and set `ready` to `true`.

Subsequent Extension and index updates must occur within the same transaction to ensure consistency.

```json
{
  "metadata.name": {
    "group-1": []
  },
  "specName": {
    "zhangsan": [
        "metadata-name-1"
    ],
    "lisi": [
        "metadata-name-2"
    ]
  },
  "halo.run/hidden": {
    "true": [
        "metadata-name-3"
    ],
    "false": [
        "metadata-name-4"
    ]
  }
}
```

### Index Pre-validation

1. On startup, check if the index is `ready`.
2. The count of `metadata.name` entries must match the total Extension count in the database.
3. ASC entries must be in ascending order; DESC entries in descending order.
4. The number of index entries per index must not exceed the total Extension count.

### Declaring Indexes on Extensions

Manual registration:

```java
public class IndexSpec {
    private String name;
    private IndexAttribute indexFunc;
    private OrderType order;
    private boolean unique;

    public enum OrderType {
        ASC, DESC
    }
}

IndexSpecs indexSpecs = indexSpecRegistry.indexFor(Person.class);
indexSpecs.add(new IndexSpec()
    .setName("spec.name")
    .setOrder(IndexSpec.OrderType.DESC)
    .setIndexFunc(IndexAttributeFactory.simpleAttribute(Person.class,
        e -> e.getSpec().getName())
    )
    .setUnique(false));
```

Using annotations for standard indexes:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface Index {
  String name();
  String field();
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Indexes {
    Index[] value() default {};
}
```

```java
@Data
@Indexes({
  @Index(name = "specName", field = "spec.name"),
  @Index(name = "creationTimestamp", field = "metadata.creationTimestamp"),
})
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@GVK(group = "my-plugin.guqing.io",
        version = "v1alpha1",
        kind = "Person",
        plural = "persons",
        singular = "person")
public class Person extends Extension {

    @Schema(description = "The description on name field", maxLength = 100)
    private String name;

    @Schema(description = "The description on age field", maximum = "150", minimum = "0")
    private Integer age;

    @Schema(description = "The description on gender field")
    private Gender gender;

    public enum Gender {
        MALE, FEMALE,
    }
}
```

Both manual and annotation-based index registration are managed by `IndexSpecRegistry`:

```java
public interface IndexSpecRegistry {
    <E extends Extension> IndexSpecs indexFor(Class<E> extensionType);
    <E extends Extension> IndexSpecs getIndexSpecs(Class<E> extensionType);
    boolean contains(Class<? extends Extension> extensionType);
    void removeIndexSpecs(Class<? extends Extension> extensionType);
    @NonNull String getKeySpace(Scheme scheme);
}
```

Extensions with indexes can use `IndexedQueryEngine` for queries:

```java
public interface IndexedQueryEngine {
    ListResult<String> retrieve(GroupVersionKind type, ListOptions options, PageRequest page);
    List<String> retrieveAll(GroupVersionKind type, ListOptions options);
}
```

For convenience, `ReactiveExtensionClient` provides a `listBy` method:

```java
public interface ReactiveExtensionClient {
  <E extends Extension> Mono<ListResult<E>> listBy(Class<E> type, ListOptions options, PageRequest pageable);
}
```

`ListOptions` contains `LabelSelector` and `FieldSelector`. Example:

```java
var listOptions = new ListOptions();
listOptions.setLabelSelector(LabelSelector.builder()
  .eq("key1", "value1").build());
listOptions.setFieldSelector(FieldSelector.builder()
  .eq("slug", "slug1").build());
```

For API compatibility, `IListRequest` can be converted to `ListOptions` and `PageRequest`:

```java
class QueryListRequest implements IListRequest {
    public ListOptions toListOptions() {
        return labelAndFieldSelectorToListOptions(getLabelSelector(), getFieldSelector());
    }
    public PageRequest toPageRequest() {
        return PageRequestImpl.of(getPage(), getSize(), getSort());
    }
}
```

### Reconciler Impact

Previously, Reconcilers with `syncAllOnStart` loaded all Extension data into memory for reconciliation. With indexes, only `metadata.name` values are loaded to trigger reconciliation, significantly reducing memory usage.

The GcReconciler also uses the index to find Extensions with non-null `metadata.deletionTimestamp` by name, avoiding full data loads.
