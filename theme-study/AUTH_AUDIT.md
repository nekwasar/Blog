# Theme "Alright" — Authentication & Interaction Audit

## How the Alright Theme Was Built (Live Site Analysis)

### 1. COMMENT SYSTEM — Already Anonymous-Friendly

**Plugin used:** `PluginCommentWidget` v3.1.1 (by halo-dev)

**How it works currently:**
- The comment form shows **name + email + website fields** for anonymous users by default
- Login is **optional** — shown as a small "(Or login)" link, NOT a wall
- When logged in, users see their avatar/name and can logout
- When anonymous, they fill in displayName, email, and optional website
- Anonymous comments can be made "private" (only visible to admin)
- Supports `anonymousCommentCaptcha` — a CAPTCHA can be enabled specifically for anonymous commenters

**Key finding: No signup required to comment.** The comment widget source code explicitly checks `!this.currentUser && this.allowAnonymousComments` and renders the anonymous name/email/website form. Login is a choice, not a requirement.

```
Current comment UX:
┌─────────────────────────────────┐
│  Comment box (rich text)        │
├─────────────────────────────────┤
│  [Name*] [Email*] [Website]  (Or login) │
│                                                     │
│  [Private?]               [Submit]          │
└─────────────────────────────────┘
```

### 2. LIKE / UPVOTE SYSTEM — Already Anonymous

**How it works currently:**
- Uses cookie-based tracking (`suxing_ding_${postId}`)
- Posts to `/apis/api.halo.run/v1alpha1/trackers/upvote` via AJAX
- No authentication token or session required
- Each device/browser gets one like per post (cookie-based deduplication)
- Heart icon toggles between filled/outline when liked

**Key finding: Zero auth needed.** The like system is entirely client-side cookie-based. An anonymous user can like any post.

### 3. OTHER INTERACTIONS — Auth Check

| Feature | Auth Required? | Implementation |
|---------|:-------------:|----------------|
| Comment (write) | No | Anonymous form fields + optional login link |
| Comment (read) | No | Public content, rendered server-side |
| Like/Upvote | No | Cookie-based, AJAX to `/trackers/upvote` |
| Share | No | Client-side share modal (QR code, native, social) |
| Search | No | PluginSearchWidget, client-side search |
| Post read (content) | No | Fully public |
| Color scheme toggle | No | LocalStorage + system preference |
| Subscribe/notify | Yes (opt-in) | Would need auth, not currently used by this theme |
| "Private" comment | No | Anonymous can send private comments (only admin sees) |

### 4. AUTH CHECKS IN THEME TEMPLATES

**The Alright theme does NOT gate any content behind auth.**
- No `sec:authorize` checks found in rendered pages
- No "login to see" patterns
- The header shows a user icon dropdown, but for anonymous users it simply shows a "Login" link at the bottom
- Navigation, posts, pages, archives — all fully public

### 5. ADMIN ANALYTICS (What Gets Recorded)

Halo's `StatsEndpoint` tracks for the admin dashboard:

| Metric | Source | Visible to Admin |
|--------|--------|:----------------:|
| Total visits | `Counter.visit` aggregated | Dashboard |
| Total comments | `Counter.totalComment` | Dashboard |
| Approved comments | `Counter.approvedComment` | Dashboard |
| Upvotes | `Counter.upvote` | Dashboard |
| User count | `User` extension count | Dashboard |
| Post count | `Post` extension count | Dashboard |
| Per-post stats | Individual Counter per post | Post analytics |
| Visitor events | `VisitedEvent` | Analytics (if enabled) |
| Trackers | `TrackerEndpoint` | Upvote/similar tracking |

Admin can see:
- Which posts get the most visits, comments, likes
- Individual comment content (for moderation)
- Visitor IPs and timestamps (if comment tracking is on)
- All comments including "private" ones

---

## SUMMARY: What Needs Changing for Your Requirements

### Already Works (Zero Changes Needed)
- Anonymous commenting ✅ — already the default
- Anonymous liking ✅ — already cookie-based
- No signup wall ✅ — no auth gates anywhere
- Admin analytics ✅ — built into Halo

### What You'd Want to Customize
1. **Remove the "(Or login)" link** from comment form if you want to fully hide auth
2. **Remove the user icon dropdown** from header (or replace with just the dark mode toggle)
3. **Enable `anonymousCommentCaptcha`** for spam protection (optional)
4. **Add a "subscribe to replies" feature** for anonymous commenters (requires email validation, not built-in)
5. **Customize the like emoji/count UI** (currently a heart icon)
6. **Add anonymous name persistence** via localStorage so returning anonymous users don't retype

### What's NOT Possible (Without Major Changes)
- Halo doesn't have built-in anonymous subscription/notification — would need a custom plugin
- Anonymous users can't edit/delete their own comments (no identity proof)

---

## ORIGINAL THEME DEPENDENCIES

| Dependency | Version | Used For | Notes |
|-----------|---------|----------|-------|
| PluginCommentWidget | 3.1.1 | Comment system | Supports anonymous by default |
| PluginSearchWidget | 1.7.0 | Site search | No auth needed |
| editor-hyperlink-card | 1.5.2 | Link preview cards | Display only |
| Bootstrap 4 | Custom | Layout grid | CSS framework |
| Alpine.js | Latest | Interactivity | Client-side state |
| jQuery | Latest | DOM manipulation | In nicetheme.js |
| Swiper | Latest | Image/carousel sliders | |
| Fancybox | 5.x | Lightbox | Image zoom |
| AOS | Latest | Scroll animations | |
| Panzoom | Latest | Image zoom toolbar | |
| Theia Sticky Sidebar | Latest | Sticky sidebar | |
| iconfont (custom) | — | Icons | Custom icon font set |
| MapleMono font | — | Typography | Nerd font |
