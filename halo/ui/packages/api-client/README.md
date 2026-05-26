# @halo-dev/api-client

Halo 2.0 JavaScript API client library. Generated using [OpenAPI Generator](https://openapi-generator.tech/).

## Usage

```javascript
import {
  coreApiClient,
  consoleApiClient,
  ucApiClient,
  publicApiClient,
  createCoreApiClient,
  createConsoleApiClient,
  createUcApiClient,
  createPublicApiClient,
  axiosInstance,
} from "@halo-dev/api-client";
```

- **coreApiClient**: CRUD API client for all Halo custom models.
- **consoleApiClient**: API client for Console-specific endpoints.
- **ucApiClient**: API client for User Center endpoints.
- **publicApiClient**: API client for publicly accessible endpoints.
- **createCoreApiClient**: Factory for custom model CRUD clients (requires axios instance).
- **createConsoleApiClient**: Factory for Console API clients (requires axios instance).
- **createUcApiClient**: Factory for UC API clients (requires axios instance).
- **createPublicApiClient**: Factory for public API clients (requires axios instance).
- **axiosInstance**: Default axios instance.

### Usage in Plugins

```shell
pnpm install @halo-dev/api-client axios
```

Since the Console and UC projects already include and configure Axios interceptors, just import directly:

```javascript
import { coreApiClient } from "@halo-dev/api-client";

coreApiClient.content.post.listPost().then((response) => {
  // handle response
});
```

In `@halo-dev/ui-plugin-bundler-kit@2.17.0+`, `@halo-dev/api-client` and `axios` are externalized, so the final bundle automatically uses Halo's own dependencies — no need to worry about bundle size.

See: [Plugin Development / API Requests](https://docs.halo.run/developer-guide/plugin/api-reference/ui/api-request)

### Usage in External Projects

```shell
pnpm install @halo-dev/api-client axios
```

```javascript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8090",
});

const coreApiClient = createCoreApiClient(axiosInstance);

coreApiClient.content.post.listPost().then((response) => {
  // handle response
});
```
