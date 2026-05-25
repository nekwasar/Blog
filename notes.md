# Open-Source Hand-Rolled Blog CMS Projects — Full Comparison

---

# PART 1: TOP 20+ FOR AI AGENT INTEGRATION

> Criteria: AI agent (opencode/clawdbot fork) can programmatically publish posts via API.

| Rank | Project | Stars | Lang | API Type | Agent Auth | Score | Deploy | Key Notes |
|------|---------|-------|------|----------|------------|:-----:|--------|-----------|
| 1 | **agentcms/agentcms** | 3 | TS | REST | API keys (`acms_live_...`) | 10/10 | Cloudflare KV | Agent-first design. `.well-known/agent-skill.json`. Dedicated `/api/agent/publish` endpoint. MIT. |
| 2 | **mx-space/core** | 525 | TS | REST+WS+SDK | API keys (better-auth) | 10/10 | Docker+PG+Redis | Headless CMS with `@mx-space/api-client` TS SDK. Built-in AI: summaries, translation, moderation. Webhooks. NestJS. |
| 3 | **frank-mendez/nextjs-blog-cms** | new | TS | REST | API keys (`fmblog_`), SHA-256 | 9/10 | Vercel+Supabase | Developer-first. API key management dashboard. CRUD posts. Built-in AI assistant (Claude/Gemini/OpenAI). MIT. |
| 4 | **usememos/memos** | 59.5k | Go | REST+gRPC | API token | 9/10 | `docker run` | Single binary + SQLite. Clean REST API for memo CRUD. Minimal, ultra-fast. Agent can post in one call. |
| 5 | **halo-dev/halo** | 38.5k | Java | REST+GraphQL | PAT tokens | 9/10 | Docker one-click | Full API for posts/pages/categories/tags/plugins. OpenAPI docs. PAT for agents. 100+ themes/plugins. |
| 6 | **writefreely/writefreely** | 5.1k | Go | REST | OAuth 2.0, tokens | 8/10 | Single binary | Clean Markdown publishing API. ActivityPub federation. Write.as compatible API. AGPLv3. |
| 7 | **surmon-china/nodepress** | 1.5k | TS | REST | JWT | 8/10 | Docker+Mongo+Redis | NestJS REST API. Full CRUD. Production-grade. Companion AI Agent project exists. |
| 8 | **keystonejs/keystone** | 12k+ | TS | GraphQL | Custom | 8/10 | Node+PG | Auto-generated GraphQL from schema. Full CRUD. Admin UI. Extensible. MIT. |
| 9 | **tinacms/tinacms** | 13k | TS | GraphQL | GitHub OAuth | 7/10 | Tina Cloud/Vercel | Git-backed CMS. GraphQL API. Agent can commit MDX/MD to repo via GitHub API. Apache 2.0. |
| 10 | **getgrav/grav** | 15.5k | PHP | REST (plugin) | API key plugin | 7/10 | Unzip & run | Flat-file (no DB). REST via plugin. Markdown+Twig. Massive plugin ecosystem. MIT. |
| 11 | **publify/publify** | 1.9k | Ruby | REST (Rails) | Session/custom | 7/10 | Rails deploy | Standard Rails REST. Since 2004. Multi-user. Multilingual. Very stable. MIT. |
| 12 | **notcms** (qqpann/notcms) | 18 | TS | SDK (Notion API) | Notion keys | 7/10 | npm package | TypeScript SDK wrapping Notion API. Type-safe queries. Agent uses Notion API directly. Zero backend hosting. |
| 13 | **mayneyao/eidos** | 1k+ | TS | REST+SDK | API tokens | 7/10 | Desktop/PWA | Notion-like with extension SDK (TS/JS/Python). SQLite. Publish service. AGPLv3. |
| 14 | **bloom42/markdown-ninja** | 400 | Go | CLI+API | API key | 7/10 | Docker | Publish via CLI or API. Markdown-first. Alternative to Medium/Substack. AGPLv3. |
| 15 | **vvveb/Vvveb** | 1.1k | PHP | REST (internal) | Session | 6/10 | PHP+MySQL | Full CMS with blog+e-commerce. Page builder. REST endpoints exist. AGPLv3. |
| 16 | **blogifierdotnet/Blogifier** | 1.3k | C# | REST (ASP.NET) | Cookie | 6/10 | .NET 7 | ASP.NET API controllers. Blazor admin. Multi-user. MIT. |
| 17 | **firekylin/firekylin** | 1.8k | TS | REST (ThinkJS) | Session | 6/10 | Node+MySQL | REST endpoints for post CRUD. Active (v1.5.8). Chinese docs but readable code. |
| 18 | **btw-so/btw** | 1.1k | JS | Internal REST | OTP | 5/10 | Docker Compose | Medium alternative. Internal REST API exists. Clean browser editor. |
| 19 | **rsms/gitblog** | 166 | PHP | Git-based | Git creds | 5/10 | PHP+Git | No API — agent does `git commit && git push` to publish. No database. Everything versioned. MIT. |
| 20 | **BlogEngine/BlogEngine.NET** | 992 | C# | MetaWeblog API | Cookie | 5/10 | IIS/.NET | MetaWeblog API for XML-RPC posting. Since 2007. Windows-only. |
| 21 | **steampress** | 378 | Swift | REST (Vapor) | Session | 5/10 | Swift/Vapor | Blog engine in Swift (Vapor). Server-side Swift. REST API. |
| 22 | **dingoblog/dingo** | 280 | Go | REST | — | 5/10 | Go binary | Blog engine in Go. REST API. Lightweight. |

---

# PART 2: TOP 20+ FOR ENTERPRISE-LEVEL MANAGEMENT

> Criteria: Extremely detailed admin, mobile-friendly, SEO-friendly, no hidden costs, easy setup.

| Rank | Project | Stars | Lang | Admin Score | Setup | License | Standout Features |
|------|---------|-------|------|:-----------:|-------|---------|-------------------|
| 1 | **halo-dev/halo** | 38.5k | Java/TS | **10/10** | Docker | GPLv3 | Full dashboard: users/roles, posts, pages, media, themes (+100), plugins (+100), analytics, scheduling, SEO, i18n, comments, backups, import/export, sitemap. Pro: native mobile app + AI. |
| 2 | **microweber/microweber** | 3.4k | PHP | **10/10** | One-click | MIT | Drag-drop builder + blog + e-commerce. Live-editing. Products/orders/customers. SEO, analytics, templates. Most feature-packed admin of all hand-rolled CMS. |
| 3 | **getgrav/grav** | 15.5k | PHP | **9/10** | Unzip & run | MIT | Admin Plugin: content pages, media manager, user/group permissions, GPM manager, backups, multi-language, SEO metadata per page, scheduling, Markdown. Flat-file (no DB). |
| 4 | **typecho/typecho** | 12.3k | PHP | **9/10** | 5-min PHP | GPLv2 | Admin: posts, pages, categories, tags, media, themes, plugins, comments, multi-user, custom fields, Markdown. <500KB. v1.3.0 active. |
| 5 | **bludit/bludit** | 1.4k | PHP | **9/10** | Unzip & run | MIT | Admin: posts, pages, categories, tags, users, themes, plugins, media, SEO, scheduling, API, multi-language. Flat-file. Auto-save drafts. Active (v3.21.1). |
| 6 | **mx-space/core** | 525 | TS | **8/10** | Docker+PG+Redis | AGPLv3/MIT | Vue3 admin: posts, notes, pages, categories, comments, topics, RSS/sitemap, JWT/passkey/OAuth. AI summaries/translation/moderation. Lexical editor. WebSocket real-time. |
| 7 | **publify/publify** | 1.9k | Ruby | **7/10** | Rails deploy | MIT | Multi-user: articles, pages, tags, media, themes, sidebar plugins, SEO, 15+ languages, text filters, widgets, Twitter integration. Since 2004. |
| 8 | **firekylin/firekylin** | 1.8k | TS | **7/10** | Node+MySQL | GPLv3 | Admin: posts, pages, push notifications, theme customization, system settings, user management, comments. ThinkJS3+React+Vite. |
| 9 | **blogifierdotnet/Blogifier** | 1.3k | C# | **7/10** | .NET 7 | MIT | Blazor WASM admin: posts (draft/publish), categories, users/authors, media, themes, custom pages, RSS, tags, comments, import/export. |
| 10 | **btw-so/btw** | 1.1k | JS | **7/10** | Docker Compose | GPLv3 | Medium-style admin: draft/publish, OTP login, S3 image uploads, analytics, custom domains. Clean UI. |
| 11 | **BlogEngine/BlogEngine.NET** | 992 | C# | **7/10** | IIS/.NET | MS-RL | Multi-user: posts, pages, comments, categories, tags, users/roles, themes, plugins, widgets, media, RSS. Since 2007. |
| 12 | **textpattern/textpattern** | ~500 | PHP | **7/10** | PHP install | GPLv2 | Since 2001. Admin: articles, images, files, links, comments, users, themes. Tag-based taxonomy. Panel-based layout. |
| 13 | **dotclear/dotclear** | ~300 | PHP | **7/10** | PHP+MySQL | GPLv2 | French-origin. Admin: posts, comments, categories, media, users, themes, plugins, widgets, import/export, multi-language, antispam. |
| 14 | **flatpressblog/flatpress** | 208 | PHP | **6/10** | Unzip & run | GPLv2 | Admin: posts, pages, comments (spam protection), plugins, themes, widgets, users, file upload, SEO (sitemap.php). Flat-file. Multi-language. |
| 15 | **smallpath/blog** | 633 | JS | **6/10** | Node+Mongo | Apache 2.0 | Separate Vue2 admin SPA: posts, categories, tags, themes, users, JWT auth, REST API, MongoDB, SSR frontend. |
| 16 | **easycryptos/CMS-blog** | 23 | PHP | **6/10** | PHP+MySQL | BSD-3 | Dense admin: posts, pages, categories, comments (Ajax approval), 3 user roles, polls, gallery albums, newsletter, ad management, RSS, sitemap, social login. |
| 17 | **serendipity/s9y** | ~200 | PHP | **6/10** | PHP install | BSD | Oldest PHP blog engine. Admin: entries, categories, media, comments, users/groups, plugins, themes, spam protection, static pages. |
| 18 | **chyrplite/chyrplite** | ~200 | PHP | **6/10** | Unzip & run | MIT | Lightweight blog engine. Admin: posts, pages, drafts, tags, users, modules/feathers. Flat-file. |
| 19 | **automad/automad** | ~300 | PHP | **6/10** | Unzip & run | MIT | Inline-editing admin. Pages, files, users, themes, shared content blocks. JSON-based flat-file. |
| 20 | **monstra-cms/monstra** | ~500 | PHP | **6/10** | Unzip & run | MIT | Flat-file CMS. Admin: pages, posts, snippets, users, plugins, themes. Very lightweight. |
| 21 | **yasserelgammal/blog-cms** (YasserElgammal) | 91 | PHP | **6/10** | Laravel deploy | MIT | Laravel blog: posts, categories, users, roles, media, REST API, Tailwind UI admin panel. |
| 22 | **getgridea/gridea** | 10.3k | TS | **5/10** | Electron app | MIT | Desktop-only Markdown editor. Posts, tags, themes. Generates static site for GitHub Pages. |
| 23 | **wondercms/wondercms** | ~700 | PHP | **5/10** | 5-file unzip | MIT | Tiny flat-file CMS. Simple admin for pages and settings. Extreme simplicity. |

---

# METHODOLOGY — How Results Were Chosen

## Sources
- **GitHub Topics**: `blog-cms`, `blog-platform`, `blog-engine`, `personal-blog`, `headless-cms`, `self-hosted`, `blog-admin`, `note-taking`, `markdown-blog`, `blogging`
- **GitHub Search**: `"blog" + "rest api"`, `"blog" + "api key"`, `"blog" + "admin panel"`, `"blog engine"`, `"self-hosted blog"`
- **GitHub Trending** & curated collections
- Each project's **README.md** fetched and inspected for API docs, admin screenshots, feature lists, deployment instructions

## Agent Integration Scoring (0-10)
- **+3**: Well-documented REST or GraphQL API with clear endpoints
- **+2**: Token/API-key based authentication (not session-only)
- **+2**: SDK or client library available for TypeScript/Go/Python
- **+1**: Single-binary or minimal dependencies for deployment
- **+1**: Active maintenance in 2025-2026
- **+1**: Agent-specific features (webhooks, skill discovery, programmatic hooks)

## Admin Management Scoring (0-10)
- **+2**: Rich admin dashboard (posts, pages, media, categories, tags)
- **+1**: User/role management with permissions
- **+1**: Mobile-responsive admin panel
- **+1**: Built-in SEO tools (sitemap, meta tags, Open Graph)
- **+1**: Content scheduling, drafts, revision history
- **+1**: Plugin/theme ecosystem or extension system
- **+1**: Analytics, comments, or email newsletter features
- **+1**: Easy deployment (Docker, one-click, unzip-and-run)
- **+1**: Unique standout features (AI, e-commerce, builder, federation)

## Exclusion Filters
- **Enterprise products**: WordPress, Ghost, Strapi, Directus, Payload, Apostrophe, Craft CMS
- **Proprietary/paid**: Projects with hidden costs or pro-only core features
- **Abandoned**: No commits in 5+ years unless stable and functional
- **Static generators without admin**: Hugo, Jekyll, Hexo, Eleventy, Astro (without CMS backend)
- **Pure static templates**: Personal sites without CMS/admin features

## Notes
- Stars are approximate as of May 2026
- Projects marked "new" may have low stars but are being actively built
- Some PHP projects listed as "~" stars are estimated from GitHub topic pages
- "Hand-rolled" = built by individual developers or small teams, not venture-backed companies

---

# QUICK PICKS

| Your Priority | Best Pick | Runner-Up |
|---------------|-----------|-----------|
| Agent Integration | agentcms (purpose-built for agents) | mx-space/core (SDK + AI features) |
| Mobile Admin | Halo (responsive + Pro native app) | bludit (flat-file, mobile-ready admin) |
| Both Equally | mx-space/core (SDK + AI admin) | Halo (API + full admin) |
| Fastest Setup | Memos (`docker run` one command) | bludit (unzip and go) |
| Most Features | Halo (full-stack blog platform) | microweber (blog + e-commerce + builder) |
| AI Built-In | mx-space/core (LLM providers native) | frank-mendez/nextjs-blog-cms (AI assistant) |
