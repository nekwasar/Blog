# Custom FormKit Input Components

## Motivation

All forms in the Console use FormKit, but the built-in Input components do not cover every requirement. We need custom input components. Additionally, plugins and themes need to easily access system data, so we also need data-aware selection components.

## Available Types

- `code`: Code editor
  - Parameters:
    1. language: supports `yaml`, `html`, `css`, `javascript`, `json`
    2. height: editor height, e.g. `100px`
- `attachment`: Attachment selector
  - Parameters:
    1. accepts: allowed file types, e.g. `image/*`
- `repeater`: Object collection with visual editing
  - Parameters:
    1. min: minimum count, default `0`
    2. max: maximum count, default `Infinity`
    3. addLabel: add button text, default `Add`
    4. addButton: show add button, default `true`
    5. upControl: show move up button, default `true`
    6. downControl: show move down button, default `true`
    7. insertControl: show insert button, default `true`
    8. removeControl: show remove button, default `true`
- `list`: Dynamic array list
  - Parameters:
    1. itemType: data type for initialization (`string`, `number`, `boolean`, `object`), default `string`
    2. min: minimum count, default `0`
    3. max: maximum count, default `Infinity`
    4. addLabel: add button text, default `Add`
    5. addButton: show add button, default `true`
    6. upControl: show move up button, default `true`
    7. downControl: show move down button, default `true`
    8. insertControl: show insert button, default `true`
    9. removeControl: show remove button, default `true`
- `menuCheckbox`: Select multiple menus
- `menuRadio`: Select one menu
- `menuSelect`: Generic menu selector (single, multiple, sortable)
- `menuItemSelect`: Select a menu item
- `postSelect`: Select a post
- `singlePageSelect`: Select a custom page
- `categorySelect`: Select a category
  - Parameters:
    1. multiple: allow multiple selection, default `false`
- `categoryCheckbox`: Select multiple categories
- `tagSelect`: Select a tag
  - Parameters:
    1. multiple: allow multiple selection, default `false`
- `tagCheckbox`: Select multiple tags
- `verificationForm`: Remote validation form
  - Parameters:
    1. action: validation API endpoint
    2. label: button text
    3. buttonAttrs: extra button attributes
- `secret`: Select or manage secrets
  - Parameters:
    1. requiredKeys: array of `{ key, help }` objects
- `select`: Custom selector component
  - Parameters:
    1. `options`: static data source (ignored when `action` or `remote` is set)
    2. `action`: remote dynamic data source API endpoint
    3. `requestOption`: request params for dynamic data
    4. `remote`: flag for custom remote data source
    5. `remoteOption`: handler for search and key-value pairs (required when `remote` is `true`)
    6. `remoteOptimize`: optimize remote data source requests, default `true`
    7. `allowCreate`: allow creating new options, default `false` (requires `searchable`)
    8. `clearable`: allow clearing, default `false`
    9. `multiple`: allow multiple selection, default `false`
    10. `maxCount`: max selections for multiple mode, default `Infinity`
    11. `sortable`: enable drag sorting, default `false` (multiple mode only)
    12. `searchable`: enable search, default `false`
    13. `autoSelect`: auto-select first option when value is empty, default `true` (single mode only)

### Usage in Vue SFC

```vue
<script lang="ts" setup>
const postName = ref("");
</script>

<template>
  <FormKit
    v-model="postName"
    placeholder="Select an article"
    label="Article"
    type="postSelect"
    validation="required"
  />
</template>
```

### Usage in FormKit Schema (plugin/theme settings)

```yaml
- $formkit: menuRadio
  name: menus
  label: Footer Menu Group
```

### Select Component

A selector that supports single/multiple selection from a data set, with static and remote dynamic data loading.

#### In Vue SFC

Static data source:

```vue
<script lang="ts" setup></script>
<template>
  <FormKit
    type="select"
    label="What country makes the best food?"
    name="countries"
    placeholder="Select a country"
    allow-create
    clearable
    sortable
    multiple
    searchable
    :options="[
      { label: 'China', value: 'China' },
      { label: 'USA', value: 'USA' },
      { label: 'Japan', value: 'Japan' },
      ...
    ]"
  />
</template>
```

Dynamic data source:

```vue
<script lang="ts" setup>
const handleSelectPostAuthorRemote = {
  search: async ({ keyword, page, size }) => {
    const { data } = await consoleApiClient.user.listUsers({ page, size, keyword });
    return {
      options: data.items.map((item) => ({
        label: item.user.spec.displayName,
        value: item.user.metadata.name,
      })),
      total: data.total,
      page: data.page,
      size: data.size,
    };
  },
  findOptionsByValues: () => [],
};
</script>
<template>
  <FormKit
    type="select"
    label="Post author"
    name="post_author"
    placeholder="Select a user"
    searchable
    remote
    :remote-option="handleSelectPostAuthorRemote"
  />
</template>
```

#### In FormKit Schema

Static:

```yaml
- $formkit: select
  name: countries
  label: What country makes the best food?
  sortable: true
  multiple: true
  clearable: true
  placeholder: Select a country
  options:
    - label: China
      value: cn
    - label: France
      value: fr
    ...
```

Remote dynamic:

```yaml
- $formkit: select
  name: postName
  label: Choose a post
  clearable: true
  action: /apis/api.console.halo.run/v1alpha1/posts
  requestOption:
    method: GET
    pageField: page
    sizeField: size
    totalField: total
    itemsField: items
    labelField: post.spec.title
    valueField: post.metadata.name
    fieldSelectorKey: metadata.name
```

> [!NOTE]
> When remote data has pagination, the default option may not be on the first page. In that case, Select sends another query with `fieldSelector: ${requestOption.fieldSelectorKey}=(value1,value2,value3)` to fetch the default option's data.

### List Component

An array input component for visually editing lists. Supports dynamic add, delete, move up/down, and insert.

In Vue SFC:

```vue
<script lang="ts" setup>
const users = ref([]);
</script>
<template>
  <FormKit type="list" label="Users" add-label="Add User" item-type="string" :min="1" :max="3">
    <template #default="{ index }">
      <FormKit type="text" :index="index" validation="required" />
    </template>
  </FormKit>
</template>
```

In FormKit Schema:

```yaml
- $formkit: list
  name: users
  label: Users
  addLabel: Add User
  min: 1
  max: 3
  itemType: string
  children:
    - $formkit: text
      index: "$index"
      validation: required
```

> [!NOTE]
> `list` has exactly one child node, and must pass the `index` prop to it. Use a `group` component for multiple fields.

Result:

```json
{ "users": ["Jack", "John"] }
```

### Repeater Component

A collection input component for visually editing object arrays.

In Vue SFC:

```vue
<script lang="ts" setup>
const users = ref([]);
</script>
<template>
  <FormKit type="repeater" label="Users" add-label="Add User" :min="1" :max="3">
    <FormKit type="text" label="Full Name" name="full_name" validation="required" />
    <FormKit type="email" label="Email" name="email" validation="required|email" />
  </FormKit>
</template>
```

In FormKit Schema:

```yaml
- $formkit: repeater
  name: users
  label: Users
  addLabel: Add User
  min: 1
  max: 3
  items:
    - $formkit: text
      name: full_name
      label: Full Name
      validation: required
    - $formkit: email
      name: email
      label: Email
      validation: required|email
```

Result:

```json
[
  { "full_name": "Jack", "email": "jack@example.com" },
  { "full_name": "John", "email": "john@example.com" }
]
```
