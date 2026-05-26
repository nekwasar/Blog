<p align="center">
  <img src="https://img.shields.io/badge/Nekwasar%20Blog-8B5CF6?style=for-the-badge" alt="Nekwasar Blog">
  <br>
  <i>Forked from <a href="https://github.com/halo-dev/halo">Halo</a> · Theme: <b>Anon</b></i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Theme-Nebula%20Glass-8B5CF6?style=flat-square&labelColor=0f0f13" alt="Nebula Glass">
  <img src="https://img.shields.io/github/license/nekwasar/Blog?style=flat-square&color=8B5CF6" alt="License">
  <img src="https://img.shields.io/github/last-commit/nekwasar/Blog?style=flat-square&color=8B5CF6" alt="Last Commit">
</p>

---

## 🌌 Nebula Glass — The Anon Theme

Glassmorphism · Rainbow animated borders · Holographic sheen · Particle grid · Staggered reveals · Ripple clicks

Dark mode exclusive glow, clean light mode. No signup to comment or like. English-first.

**Routes:** `/` `/archives` `/posts/{slug}` `/categories` `/tags` `/links` `/moments` `/photos`

## ⚡ What's Inside

| | |
|---|---|
| **Anon Theme** | 28 custom Thymeleaf templates, Alpine.js, Lucide icons |
| **Halo Core** | Forked `halo-dev/halo` v2.24, Java 21, Spring Boot, Vue 3 |
| **Patches** | Console locale detection, all Chinese UI/README → English |

## 🛠 Deploy

```bash
docker run -d --name halo -p 8090:8090 -v ~/.halo2:/root/.halo2 halohub/halo:2.24
```

Upload `theme-anon.zip` → Console → Themes → Install.
