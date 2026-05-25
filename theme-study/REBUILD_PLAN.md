# Plan: Fix All 28 Templates to Match Alright CSS Classes

## Root Cause

The CSS file `style.css` (copied from Alright) targets **specific CSS class names**. Our templates were written from scratch and use different class names. The CSS rules never fire, so the page renders as raw Bootstrap skeleton without styling.

---

## Alright Theme Body Structure (Source of Truth)

```
<body>
  <div class="site-preloader"><div class="spinner"></div></div>    ← preloader (JS removes on load)
  <div class="site-background"></div>                               ← background overlay
  <div class="site-background site-dark-background"></div>          ← dark mode background

  <header class="site-navbar navbar navbar-expand-xl navbar-dark hide-header-bg">
    <div class="container">
      <a class="navbar-brand magic-hover">
        <img class="logo"> / <img class="logo logo-dark">
      </a>
      <div class="collapse navbar-collapse px-lg-5">
        <ul class="navbar-nav navbar-site gap-2 mx-auto">
          <li class="menu-item">
            <a><i class="menu-icon"></i><span class="menu-text"></span></a>
          </li>
          <li class="menu-item menu-item-has-children">                ← dropdown parent
            <ul class="sub-menu">...</ul>
          </li>
        </ul>
      </div>
      <ul class="navbar-sub d-flex flex-wrap flex-shrink-0 align-items-center justify-content-end gap-1 gap-md-2 ms-md-4">
        <div class="relative">                                         ← color scheme switcher
          <a class="btn btn-link btn-rounded btn-sm btn-icon">
            <i class="iconfont icon-palette_line"></i>
          </a>
          <ul class="colorScheme-dropdown text-sm">...</ul>
        </div>
        <a class="search-taggle btn btn-link btn-rounded btn-sm btn-icon">   ← search
          <i class="iconfont icon-search_3_line"></i>
        </a>
        <a class="mobile-aside-toggle d-xl-none btn btn-link btn-rounded btn-sm btn-icon">  ← mobile menu
          <i class="iconfont icon-menu_line"></i>
        </a>
      </ul>
    </div>
  </header>

  <main class="site-main h-v-75">
    <div class="container">
      <div class="row g-3">

        <!-- ===== LEFT SIDEBAR (desktop only) ===== -->
        <aside class="sidebar-left col-md-4 col-xl-3 d-none d-md-block">

          [1] PROFILE BLOCK
          <div class="profile-block box-block block w-100 text-center mb-3">
            <div class="flex-avatar mx-auto"><img></div>
            <div class="profile-name font-title">Site Title</div>
            <div class="d-flex justify-content-center mt-2">
              <span class="author-badge font-title fw-bold">站长</span>
            </div>
            <div class="text-secondary text-sm mt-3">
              <div class="h-2x">Bio/description</div>
            </div>
            <!-- Stats Grid (4 items) -->
            <div class="data-block mt-3 mb-3">
              <div class="row g-2 g-lg-3">
                <div class="col-6">
                  <div class="item box-block nopd-block block">
                    <div class="item-content">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="font-title text-xs text-secondary">Label</div>
                      </div>
                      <div class="d-flex justify-content-between mt-auto">
                        <div class="font-number text-xxl lh-1">Count</div>
                      </div>
                      <div class="item-icon" style="background-image: url(...)"></div>
                    </div>
                  </div>
                </div>
                <!-- ... 3 more col-6 ... -->
              </div>
            </div>
          </div>

          [2] SOCIAL BLOCK
          <div class="social-block box-block block d-none d-md-block w-100 mb-3">
            <div class="mb-3 mb-xl-4">Social title</div>
            <div class="social-list">...</div>
          </div>

          [3] ANNOUNCEMENT BLOCK (if set)
          <div class="announcement-block box-block block d-flex align-items-center justify-content-center flex-column w-100 mb-3">
            <div class="announcement-inner">
              <div class="announcement-list">
                <div class="announcement-item">...</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ===== MAIN CONTENT COLUMN ===== -->
        <div class="col-md-8 col-xl-6">

          <!-- Forum / Category Tabs -->
          <div class="forum-wrapper">
            <div class="forum-tab font-title block p-3">
              <div class="forum-tabmenu">All | Cat1 | Cat2 | ...</div>
            </div>

            <!-- Hero Banner Slider (if header_widget set) -->
            <div class="forum-banner banner-nextprev">
              <div class="swiper mySwiper rounded">
                <div class="swiper-wrapper">
                  <div class="swiper-slide">
                    <div class="media media-3x1">...</div>
                  </div>
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
              </div>
            </div>

            <!-- Post Cards -->
            <div class="forum-posts">
              <!-- Each post card: -->
              <div class="item block p-3">
                <div class="item-info d-flex align-items-center justify-content-between gap-3 mb-3">
                  <div class="info-avatar flex-avatar"><img></div>
                  <div class="info-content">
                    <div class="info-name">Category / Author</div>
                    <div class="info-data text-muted text-xs">Date · Views</div>
                  </div>
                  <div class="info-actions">...</div>
                </div>
                <div class="item-content">
                  <div class="item-desc">Post title (h2)</div>
                  <div class="text-secondary text-sm h-3x mt-1 mt-md-2">Excerpt</div>
                  <div class="item-images mt-2 mt-md-3">
                    <div class="hover-content">Cover image</div>
                  </div>
                  <div class="item-actions font-number d-flex align-items-center justify-content-evenly mt-3">
                    <a class="action-button">Views: N</a>
                    <a class="action-button">Comments: N</a>
                    <a class="action-button like-action">❤ N</a>
                    <a class="action-button share-action">Share</a>
                  </div>
                </div>
              </div>
              <!-- ... more items ... -->
            </div>
          </div>

          <!-- Pagination -->
          <nav class="pagination-container mt-3 mt-md-4">
            <div class="pagination">
              <div class="page-number current">1</div>
              <a class="page-number">2</a>
              <a class="page-number">Next</a>
            </div>
          </nav>
        </div>

        <!-- ===== RIGHT SIDEBAR (xl only) ===== -->
        <aside class="sidebar-right col-xl-3 d-none d-xl-block">

          [4] BLOG LIST (latest posts widget)
          <div class="blog-block box-block block w-100 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-3 mb-xl-4">
              Latest Posts
            </div>
            <div class="blog-list font-title">
              <div class="text-sm h-1x"><a>Post title</a></div>
              <!-- ... -->
            </div>
          </div>

          [5] TAGS BLOCK
          <div class="tags-block box-block block w-100 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-3 mb-xl-4">
              Tags
            </div>
            <div class="tags-list">...</div>
          </div>

          [6] CATEGORIES BLOCK
          <div class="tags-block box-block block w-100 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-3 mb-xl-4">
              Categories
            </div>
            <div class="cats-list">...</div>
          </div>

          [7] AD/IMAGE WIDGET
          <div class="widget widget_media_image box-block block d-none d-md-block mb-3" data-aos="zoom-in">
            <div class="widget-header d-flex justify-content-between align-items-center mb-3 mb-xl-4">
              Ad Title
            </div>
            <img>
          </div>
        </aside>
      </div>
    </div>
  </main>

  <footer class="site-footer text-muted text-sm text-center py-4 py-md-5">
    <div class="container">
      Copyright © 2026 Site Title. All rights reserved. Powered by Halo.
      ICP beian...
    </div>
  </footer>

  <!-- Scroll toolbar -->
  <div class="scroll-toolbar">
    <div class="scroll-backtotop"><i class="iconfont icon-arrow_to_up_line"></i></div>
  </div>

  <!-- Mobile aside -->
  <aside class="mobile-aside">
    <div class="aside-overlay"></div>
    <div class="aside-body">...</div>
  </aside>
</body>
```

---

## Component-by-Component Fix Plan

### Phase 1: Fix CSS/JS includes (add missing dependencies)

**Current:** Only bootstrap, iconfont, animate, style  
**Needed (add):** fancybox CSS+JS, aos CSS+JS, swiper CSS+JS, panzoom CSS+JS, theia-sticky-sidebar JS

**Files to edit:** ALL templates (head section)

### Phase 2: Fix header.html

| Element | Current class | Must be |
|---------|:---:|---|
| `<header>` | `header` | `site-navbar navbar navbar-expand-xl navbar-dark hide-header-bg` |
| Container | `.container` | `.container` ✓ |
| Brand link | `.navbar-brand` | `.navbar-brand magic-hover` |
| Logo img | none | `.logo` / `.logo.logo-dark` |
| Nav collapse | `.collapse.navbar-collapse` | `.collapse.navbar-collapse.px-lg-5` |
| Nav ul | `.navbar-site.mr-auto` | `.navbar-nav.navbar-site.gap-2.mx-auto` |
| Menu item | `.menu-item` | `.menu-item` ✓ |
| Menu icon | none | `.menu-icon` (font icon inside `i`) |
| Dropdown parent | `.menu-item.menu-item-has-children` | ✓ |
| Sub-menu | `.sub-menu` | ✓ |
| Actions ul | none | `.navbar-sub.d-flex.flex-wrap.flex-shrink-0.*` |
| Color scheme | x-data inline | `<div class="relative">` + `<ul class="colorScheme-dropdown text-sm">` |
| Search btn | `.btn.btn-icon.btn-sm.btn-link.search-trigger` | `.search-taggle.btn.btn-link.btn-rounded.btn-sm.btn-icon` |
| Mobile btn | `.btn.btn-icon.btn-sm.btn-link.mobile-aside-toggle.d-xl-none` | `.mobile-aside-toggle.d-xl-none.btn.btn-link.btn-rounded.btn-sm.btn-icon` |
| Mobile aside | `.mobile-aside` | `.mobile-aside` with `.aside-overlay` + `.aside-body` |

### Phase 3: Fix index.html (homepage layout)

| Element | Current | Must be |
|---------|---------|---------|
| `<main>` | `<main class="site-main">` | `<main class="site-main h-v-75">` |
| Left sidebar | `.sidebar-left.col-md-4.col-xl-3.d-none.d-md-block` | ✓ (add inner structure) |
| Profile card | `.block.card.p-0` | `.profile-block.box-block.block.w-100.text-center.mb-3` |
| Avatar | `.flex-avatar.w-80.mx-auto.d-block` | `.flex-avatar.mx-auto` |
| Author name | `.font-title.text-xl` | `.profile-name.font-title` |
| Badge | none | `.author-badge.font-title.fw-bold` |
| Bio text | `.text-xs.text-muted` | `.text-secondary.text-sm.mt-3` nested in `.h-2x` |
| Stats grid | `.row.text-center` with `.bg-light.rounded` | `.data-block.mt-3.mb-3` > `.row.g-2.g-lg-3` |
| Stat item | `.col-3.p-1` | `.col-6` > `.item.box-block.nopd-block.block` |
| Stat label | `.text-xs.text-muted.mt-1` | `.font-title.text-xs.text-secondary` |
| Stat count | `.font-number.text-xl` | `.font-number.text-xxl.lh-1` |
| Social block | none | `.social-block.box-block.block.d-none.d-md-block.w-100.mb-3` |
| Main column | `.col-md-8.col-xl-6` | ✓ |
| Category tabs | `.list-grouped` with badges | `.forum-wrapper` > `.forum-tab.font-title.block.p-3` |
| Banner | none | `.forum-banner.banner-nextprev` with `.swiper.mySwiper` |
| Post list | `.list-grouped` | `.forum-posts` |
| Post card | `.list-item.block` | `.item.block.p-3` |
| Post card info | `.d-flex` | `.item-info.d-flex.align-items-center.justify-content-between.gap-3.mb-3` |
| Post avatar | none | `.info-avatar.flex-avatar` |
| Post meta | `.text-xs.text-muted` | `.info-content` > `.info-name` + `.info-data.text-muted.text-xs` |
| Post title | `.list-title.font-title.text-md.h-2x` | Inside `.item-content` > `.item-desc` |
| Post excerpt | `.text-xs.text-muted.h-2x` | `.text-secondary.text-sm.h-3x.mt-1.mt-md-2` |
| Post cover | `.media.media-3x2` | `.item-images.mt-2.mt-md-3` > `.hover-content` |
| Post actions | `.list-footer.d-flex` | `.item-actions.font-number.d-flex.align-items-center.justify-content-evenly.mt-3` |
| View count | icon + span | `a.action-button` with `.icon-eye_2_line` |
| Comment count | icon + span | `a.action-button` with `.icon-chat_4_line` |
| Like count | icon + span | `a.action-button.like-action` with heart icon |
| Share | none | `a.action-button` with share icon |
| Pagination | separate module | `nav.pagination-container.mt-3.mt-md-4` > `.pagination` > `.page-number` |
| Right sidebar | `.sidebar-right.col-xl-3.d-none.d-xl-block` | ✓ |
| Blog widget | none | `.blog-block.box-block.block.w-100.mb-3` |
| Tags widget | `.block.box-block` | `.tags-block.box-block.block.w-100.mb-3` |
| Image widget | none | `.widget.widget_media_image.box-block.block.*` |

### Phase 4: Fix post-card.html module

Rewritten to match the `.item.block.p-3` structure from index:
- Item info bar (avatar + name + date)
- Item content (title + excerpt + cover image)
- Item actions bar (views · comments · likes · share)

### Phase 5: Fix footer.html

| Element | Current | Must be |
|---------|---------|---------|
| `<footer>` | generic | `<footer class="site-footer text-muted text-sm text-center py-4 py-md-5">` |
| ICP beian | simplified | Match the exact beian structure |

### Phase 6: Fix all other templates

Apply the same structural corrections to: posts, pages, archives, categories, category, tags, tag, author, links, moments, photos, error.

---

## CSS Classes Mapping Cheat Sheet

```
OUR CLASS                    →  ALRIGHT CLASS
─────────────────────────────────────────────────
.block.card.p-0              →  profile-block.box-block.block.w-100.text-center.mb-3
.block.card                  →  box-block.block
.list-item.block             →  item.block.p-3
.list-title.font-title       →  item-desc (inside item-content)
.list-grouped                →  forum-wrapper > forum-posts
.mb-3 (category tabs)        →  forum-tab.font-title.block.p-3
badge.bg-primary              →  forum-tabmenu items
.bg-light.rounded            →  item.box-block.nopd-block.block
.col-3.p-1                   →  col-6
.font-number.text-xl         →  font-number.text-xxl.lh-1
.text-xs.text-muted           →  font-title.text-xs.text-secondary
.d-flex.justify-content-between →  align-items-center also needed
.row.text-center             →  row.g-2.g-lg-3
.list-footer                 →  item-actions.font-number.d-flex.align-items-center.justify-content-evenly.mt-3
.text-dark.dark:text-slate   →  text-secondary (CSS handles dark mode)
```

---

## Files to Modify (in order)

### Batch 1 — Head/Footer fragments (2 files)
1. `templates/modules/header.html` — Complete rewrite
2. `templates/modules/footer.html` — Class name fixes

### Batch 2 — Core modules (6 files)
3. `templates/modules/post-card.html` — Complete rewrite
4. `templates/modules/pagination.html` — Class name fixes
5. `templates/modules/sidebar.html` — Widget order + class fixes
6. `templates/modules/share.html` — Class fixes
7. `templates/modules/toc.html` — Class fixes
8. `templates/modules/like.html` — Fix to use `.action-button.like-action`

### Batch 3 — Widget modules (5 files)
9. `templates/modules/widgets/profile.html` — Complete rewrite
10. `templates/modules/widgets/latest-posts.html` — Class fixes
11. `templates/modules/widgets/categories.html` — Class fixes
12. `templates/modules/widgets/tags.html` — Class fixes
13. `templates/modules/widgets/popular-posts.html` — Class fixes

### Batch 4 — Main pages (7 files)
14. `templates/index.html` — Complete rewrite
15. `templates/post.html` — Complete rewrite
16. `templates/page.html` — Class fixes
17. `templates/archives.html` — Class fixes
18. `templates/categories.html` — Class fixes
19. `templates/category.html` — Class fixes
20. `templates/tags.html` — Class fixes
21. `templates/tag.html` — Class fixes

### Batch 5 — Remaining pages (6 files)
22. `templates/author.html` — Class fixes
23. `templates/links.html` — Class fixes
24. `templates/moments.html` — Class fixes
25. `templates/photos.html` — Class fixes
26. `templates/error/error.html` — Class fixes
27. `templates/modules/announcement.html` — Class fixes
28. `templates/modules/footer-social.html` — Class fixes

### Batch 6 — Deploy & Verify
29. Add missing JS/CSS: fancybox, aos, swiper, panzoom, sticky-sidebar
30. `docker cp` all templates to container
31. Restart Halo
32. Verify homepage renders ≥40KB (matching Alright's structural density)
33. Verify post page, archives, categories, tags all work
34. Verify dark mode toggle works
35. Verify likes, comments, search widgets load

---

## Expected Result After Fix

- Page size grows from ~14KB to ~40-50KB (matching Alright's rendered output density)
- `.box-block` cards render with proper shadows and borders
- `.site-navbar` renders the dark sticky header with proper styling
- `.profile-block` shows the author card with background images on stats
- `.forum-posts` shows post cards with the Alright card layout
- `.sidebar-right` widget blocks render with proper headers
- `.scroll-toolbar` shows the back-to-top button
- `.site-footer` renders with proper centering and beian info
- Fancybox lightbox works on post images
- AOS scroll animations trigger on widgets
- Swiper carousel works for the hero banner
