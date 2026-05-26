# Nekwasar Blog

<p align="center">
  <a href="https://nekwasar.com" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/nekwasar-Nebula%20Glass-8B5CF6?style=for-the-badge&labelColor=0f0f13">
      <img src="https://img.shields.io/badge/nekwasar-Nebula%20Glass-1A1D2E?style=for-the-badge&labelColor=f0f0f5" alt="Nekwasar Blog">
    </picture>
  </a>
</p>

<p align="center">
  <i>A privacy-first blog with a futuristic glassmorphism theme — forked from <a href="https://github.com/halo-dev/halo">Halo</a>.</i>
</p>

<p align="center">
  <a href="https://github.com/nekwasar/Blog/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-GPLv3-blue?style=flat-square" alt="License"></a>
  <a href="https://github.com/nekwasar/Blog/commits/master"><img src="https://img.shields.io/github/last-commit/nekwasar/Blog?style=flat-square&color=8B5CF6" alt="Last Commit"></a>
</p>

---

## Overview

This repository contains everything needed to run **Nekwasar Blog** — a fully customized Halo CMS deployment with a bespoke theme called **Anon**. The project is a fork of the upstream [halo-dev/halo](https://github.com/halo-dev/halo) v2.24.2, modified and themed for a futuristic, anonymous-friendly blogging experience.

### What's inside

| Component | Description |
|---|---|
| **Anon Theme** | Custom-built Halo theme with Nebula Glass design system |
| **Halo Core** | Forked from `halo-dev/halo`, Java 21 / Spring Boot / Vue 3 |
| **Theme Sources** | Full theme source in `theme-study/theme-anon/` (28 Thymeleaf templates) |
| **Research** | `notes.md` — comprehensive comparison of 40+ open-source blog CMS platforms |

## ✨ The Anon Theme

A from-scratch re-implementation inspired by the Alright theme, with zero paid code. Every visual element was custom-built.

### Design System

- **Nebula Glass** — extreme glassmorphism (`backdrop-filter: blur(24px)`) on every surface
- **Animated Rainbow Borders** — conic-gradient borders with `@property` CSS in dark mode only
- **Holographic Sheen** — metallic hover effects on cards
- **Particle Grid** — subtle background texture
- **Staggered Reveal** — cards animate in with AOS on scroll
- **Ripple Clicks** — JS-powered ripple effect on interactions
- **Custom Scrollbar** — styled for both light and dark modes

### Key Features

- **Dark / Light toggle** — Alpine.js with `data-scheme="dark"` on `<body>`, zero flash (class removed on `requestAnimationFrame`)
- **Anonymous interaction** — no signup needed to comment or like (cookie-based)
- **English-first** — all UI translated, console locale patched for English by default
- **Lucide Icons** — replaced proprietary iconfont with open-source inline SVGs
- **Rainbow only at night** — accent colors (`#FF3B1F`) and animations are dark-mode exclusive; light mode is clean and professional
- **Scroll-to-top** — pill button with glassmorphism
- **Footer** — increased sizing, no "Powered by Halo"

### Pages

`/` `/archives` `/archives/{slug}` `/categories` `/categories/{slug}` `/tags` `/tags/{slug}` `/authors/{name}` `/pages/{slug}` `/links` `/moments` `/photos`

## Console Patches

The Halo admin console was modified for an English-first experience:

- **Locale detection** patched in `ui/src/locales/index.ts` — `document.documentElement.lang` added as priority between cookie and `navigator.language`
- **All hardcoded Chinese** in UI source files translated to English (SubmitButton, SystemSettings, RoleList, AttachmentGroupBadge, FormKit plugin)
- **11 README docs** translated from Chinese to English (auth, notifications, indexing, full-text search, email verification, UI docs, API client)
- **Theme settings** (`settings.yaml`, `theme.yaml`) labels translated to English

## Deploy

```bash
docker run -d --name halo -p 8090:8090 -v ~/.halo2:/root/.halo2 halohub/halo:2.24
```

Upload `theme-anon.zip` via Console → Themes → Install, then activate.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot WebFlux, R2DBC, H2 |
| Frontend | Vue 3, TypeScript, TailwindCSS, Vite |
| Theme | Thymeleaf, Alpine.js, Lucide Icons, AOS, Fancybox |
| Auth | Basic Auth, Form Login, PAT (Personal Access Token) |
| Search | Lucene (embedded) |

## License

[GPLv3](LICENSE) — same as upstream Halo.
