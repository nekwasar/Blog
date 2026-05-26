# Project Structure

This directory is the root of the Halo frontend project, containing both Console and User Center.

## Terminology

- Console: Admin panel for content management, system settings, plugins, themes, etc.
- User Center: User-facing panel for individual users.

## Directory Layout

```bash
├── console-src                         # Console source code
│   ├── composables
│   ├── layouts
│   ├── modules
│   ├── router
│   ├── stores
│   ├── styles
│   ├── views
│   ├── App.vue
│   └── main.ts
├── packages                            # Shared libraries published to npmjs.com
│   ├── api-client                      # OpenAPI-generated API client
│   ├── components                      # Base component library
│   └── shared                          # Shared library (mainly for plugins)
├── src                                 # Shared code for Console and User Center
│   ├── assets
│   ├── components
│   ├── constants
│   ├── formkit
│   ├── locales
│   ├── setup
│   ├── stores
│   ├── types
│   ├── utils
│   └── vite
├── uc-src                              # User Center source code
│   ├── router
│   ├── App.vue
│   └── main.ts
├── env.d.ts
├── console.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── prettier.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.vitest.json
├── uc.html
└── vite.config.ts                      # Shared Vite config
```

Console and User Center share the same source directory and are differentiated only by multi-page entries. They are essentially the same project.

## Development Access

In development, a single Vite Dev Server runs on port `3000`.

Access through the backend proxy:

- `http://localhost:8090/console`
- `http://localhost:8090/uc`

The backend proxies `/console/**` and `/uc/**` HTML page requests to `http://localhost:3000/` based on `halo.ui.proxy.*` in `application-dev.yaml`.

Do NOT access `http://localhost:3000/console` directly — API requests will have CORS issues.

Note: In development, the backend only proxies page entry points, not static assets. Static scripts and styles are served directly by the Vite Dev Server.

## Build Output

Console and User Center are built into the same output directory via multi-page mode:

```bash
build/dist/ui
├── console.html
├── uc.html
└── ui-assets/
```

The backend build copies these files into the application's resource directory. In production:

- `/console/**` serves `ui/console.html`
- `/uc/**` serves `ui/uc.html`
- `/ui-assets/**` serves frontend static assets
