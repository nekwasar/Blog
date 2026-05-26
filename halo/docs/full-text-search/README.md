# Implementing Full-Text Search in Halo

Theme-side needs a full-text search API for fuzzy searching posts with high performance requirements. Refer to the corresponding issue: <https://github.com/halo-dev/halo/issues/2637>.

The best local full-text search solution is Apache's open-source [Lucene](https://lucene.apache.org/). [Hibernate Search](https://hibernate.org/search/) also builds on Lucene but since Halo 2.0's custom models are not built on Hibernate, Hibernate Search is just an option — we ultimately chose not to use it despite its advantages.

Halo could also support multiple search engines like ElasticSearch, MeiliSearch, etc., similar to Hibernate's approach. The default implementation uses Lucene for the lowest deployment cost.

## Search API Design

### Search Parameters

- `keyword`: string. Search keyword.
- `sort`: string[]. Sort fields and direction.
- `offset`: number. Result offset.
- `limit`: number. Maximum results.

Example:

```bash
http://localhost:8090/apis/api.halo.run/v1alpha1/posts?keyword=halo&sort=title.asc&sort=publishTimestamp,desc&offset=20&limit=10
```

### Search Results

```yaml
hits:
  - name: halo01
    title: Halo 01
    permalink: /posts/halo01
    categories:
      - a
      - b
    tags:
      - c
      - d
  - name: halo02
    title: Halo 02
    permalink: /posts/halo02
    categories:
      - a
      - b
    tags:
      - c
      - d
query: "halo"
total: 100
limit: 20
offset: 10
processingTimeMills: 2
```

#### Pagination of Search Results

Most search engines do not directly support pagination for performance reasons, or do not recommend it.

References:

- <https://solr.apache.org/guide/solr/latest/query-guide/pagination-of-results.html>
- <https://docs.meilisearch.com/learn/advanced/pagination.html>
- <https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html>
- <https://discourse.algolia.com/t/pagination-limit/10585>

Given the above, we currently do not support pagination. However, a configurable limit per query is allowed (limit <= max_limit).

#### CJK Search Optimization

Lucene's default analyzer is not CJK-friendly. External dependencies or curated dictionaries can help with Chinese word segmentation for better search results.

Chinese analyzer Java libraries:

- <https://gitee.com/lionsoul/jcseg>
- <https://code.google.com/archive/p/ik-analyzer>
- <https://github.com/huaban/jieba-analysis>
- <https://github.com/medcl/elasticsearch-analysis-ik>
- <https://github.com/blueshen/ik-analyzer>

### Search Engine Examples

#### MeiliSearch

```bash
curl 'http://localhost:7700/indexes/movies/search' \
  -H 'Accept: */*' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,zh-TW;q=0.5' \
  -H 'Authorization: Bearer MASTER_KEY' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  ...
```

```json
{
    "hits": [...],
    "estimatedTotalHits": 10,
    "query": "halo",
    "limit": 21,
    "offset": 0,
    "processingTimeMs": 2
}
```

#### Algolia

```bash
curl 'https://og53ly1oqh-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=...' \
  ...
```

```json
{
    "results": [...]
}
```

#### Wiki (Confluence)

Confluence search example omitted for brevity — see the original file for full API examples.

### FAQ

#### Do we need unified parameter and response structures?

Pros:
- Consistent search UI across themes regardless of the underlying search engine.

Cons:
- Cannot fully leverage each search engine's unique capabilities.
- Halo Core would need to adapt to different search engines, which is cumbersome.

#### Do we need extension points for integrating other search engines?

Since Lucene is powerful enough for current requirements, why integrate other search engines?

- Lucene is used as a Halo dependency, meaning it only supports single-instance deployment, which hinders Halo's future stateless architecture.
- Other search engines (Solr, MeiliSearch, ElasticSearch, etc.) can be deployed independently. Halo only needs to communicate with them via their SDKs, regardless of multi-instance deployment.
