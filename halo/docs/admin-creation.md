# Admin Creation via Token-Based Setup

> **Enterprise-grade replacement for the first-time setup wizard.**
> Replaces the open `POST /system/setup` form with a two-step process:
> 1. A shell script generates a time-limited token on the server machine
> 2. The token is redeemed via browser or script to create the admin user

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Architecture Overview](#2-architecture-overview)
3. [Token Lifecycle](#3-token-lifecycle)
4. [File Manifest](#4-file-manifest)
5. [Component Specifications](#5-component-specifications)
   - 5.1 Shell Script: `bin/halo-admin.sh`
   - 5.2 Token Store: `AdminSetupTokenStore.java`
   - 5.3 Endpoint: `AdminSetupEndpoint.java`
   - 5.4 Template: `admin-setup.html`
   - 5.5 Modifications to Existing Files
6. [Endpoint Reference](#6-endpoint-reference)
7. [Security Considerations](#7-security-considerations)
8. [Edge Cases & Error Handling](#8-edge-cases--error-handling)
9. [Testing Strategy](#9-testing-strategy)
10. [Implementation Order](#10-implementation-order)

---

## 1. Motivation

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Unauthorized setup access** | Anyone who discovers the server URL can access `/system/setup` and create an admin account | Token requires shell access to the server |
| **Brute-force setup attempts** | Unauthenticated POST endpoint can be hit repeatedly | Token expires in 5 minutes; single-use |
| **Agent user blocks setup** | Agent users created at startup lack `HIDDEN_USER_LABEL`, causing `userInitialized()` to return `true` | Add `HIDDEN_USER_LABEL` to agent users |
| **No audit trail for admin creation** | No record of when/how admin was created | Token file serves as audit record |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Server Filesystem (~/.halo2/)                                      │
│                                                                     │
│  ┌─────────────────────────────────────┐                            │
│  │ admin-setup-token                   │  JSON file                 │
│  │ {                                   │  permissions: 600          │
│  │   "token": "a1b2...",               │  read by AdminSetupTokenStore│
│  │   "createdAt": "2026-05-30T20:00Z", │  written by halo-admin.sh │
│  │   "consumed": false                 │                            │
│  │ }                                   │                            │
│  └─────────────────────────────────────┘                            │
│                                                                     │
│  ┌─────────────────────────────────────┐                            │
│  │ agents/                             │  Agent key directory       │
│  │   agent.key                         │  Agent users marked hidden │
│  └─────────────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
         ▲ generates (shell)                    ▲ reads (server)
         │                                      │
┌────────┴──────────────────┐   ┌───────────────┴──────────────────┐
│  bin/halo-admin.sh        │   │  AdminSetupEndpoint              │
│                           │   │                                 │
│  generate                 │   │  GET  /admin-setup              │
│    → writes token file    │   │    → renders form (Thymeleaf)   │
│    → prints token + URL   │   │    → auto-fills token from ?token=│
│                           │   │                                 │
│  setup <token>            │   │  POST /admin-setup              │
│    → prompts for creds    │   │    → validates token             │
│    → POSTs JSON to server │   │    → SuperAdminInitializer       │
│  setup <t> <u> <p> [e]   │   │    → installs preset data        │
│    → non-interactive      │   │    → sets SystemState.isSetup    │
└───────────────────────────┘   └─────────────────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ DefaultSuperAdmin     │
                         │ Initializer          │
                         │  → creates User      │
                         │  → binds super-role  │
                         └──────────────────────┘
```

### Request Flow

```
Browser                                     Server
   │                                          │
   │  GET /admin-setup?token=abc123           │
   │─────────────────────────────────────────>│
   │                                          │  Check: no admin exists yet
   │                                          │  (skip userInitialized check)
   │  HTML form (token pre-filled)            │
   │<─────────────────────────────────────────│
   │                                          │
   │  POST /admin-setup                       │
   │  Content-Type: application/json          │
   │  {                                       │
   │    "token": "abc123",                    │
   │    "username": "admin",                  │
   │    "password": "myP@ssword",             │
   │    "email": "admin@example.com"          │
   │  }                                       │
   │─────────────────────────────────────────>│
   │                                          │  Validate token (constant-time)
   │                                          │  Check: not expired (<5 min)
   │                                          │  Check: not consumed
   │                                          │  Mark consumed → write to file
   │                                          │  Create admin user + role binding
   │                                          │  Install preset data
   │                                          │  Install preset plugins
   │                                          │  Install preset theme
   │                                          │  Set SystemState.isSetup = true
   │  204 No Content                          │
   │  (redirect to /console)                  │
   │<─────────────────────────────────────────│
```

---

## 3. Token Lifecycle

```
   STATE:        NONE              ACTIVE                  CONSUMED/EXPIRED
                 │                   │                          │
                 │  generate         │                          │
   Script────────┼──────────────────>│                          │
                 │  writes file      │                          │
                 │  sets perm 600    │                          │
                 │                   │                          │
                 │           ┌───────┴───────┐                  │
                 │           │  5 min window │                  │
                 │           │               │                  │
   Browser/── ─ ─│─ ─ ─ ─ ─│─ POST /admin ─>│                  │
   Script        │           │  -setup       │   consume        │
                 │           │               │──────────────────>│
                 │           │               │                  │
                 │           │   time passes  │   expire         │
                 │           │   >5 min      │──────────────────>│
                 │           └───────────────┘                  │
                 │                                              │
   Generate      │   file exists                                │
   again         │   without --force                             │
                 │──> ERROR "Token already active"               │
```

---

## 4. File Manifest

### Files to Create (4)

| # | File | Module | Purpose |
|---|------|--------|---------|
| 1 | `bin/halo-admin.sh` | `application/../resources/` (script) | Token generation + setup submission |
| 2 | `application/src/main/java/run/halo/app/security/admin/AdminSetupTokenStore.java` | `application` | In-memory token store backed by JSON file |
| 3 | `application/src/main/java/run/halo/app/security/admin/AdminSetupEndpoint.java` | `application` | `GET /admin-setup` + `POST /admin-setup` endpoints |
| 4 | `application/src/main/resources/templates/admin-setup.html` | `application` | Thymeleaf form template |

### Files to Modify (3)

| # | File | Change |
|---|------|--------|
| 5 | `application/src/main/java/run/halo/app/security/agent/AgentUserInitializer.java` | Add `HIDDEN_USER_LABEL` to agent user metadata |
| 6 | `application/src/main/java/run/halo/app/security/preauth/SystemSetupEndpoint.java` | Remove `POST /system/setup` route and old form page route |
| 7 | `application/src/main/resources/templates/setup.html` | Delete entire file |

### Files to Delete (1)

| # | File | Reason |
|---|------|--------|
| 8 | `application/src/main/resources/templates/setup.html` | Replaced by `admin-setup.html` |

---

## 5. Component Specifications

### 5.1 Shell Script: `bin/halo-admin.sh`

#### Location

`/root/blog/halo/bin/halo-admin.sh`

#### CLI Interface

```
halo-admin.sh generate [--force]
halo-admin.sh setup <token>                         (interactive)
halo-admin.sh setup <token> <username> <password> [email]  (inline)
halo-admin.sh help
halo-admin.sh version
```

#### Mode: `generate`

**Behavior:**
1. Check if `~/.halo2/admin-setup-token` exists
2. If exists and NOT `--force`: print error, show expiry time, exit 1
3. If `--force`: overwrite existing token
4. Generate 64-char hex token from `/dev/urandom` (use `openssl rand -hex 32` as fallback)
5. Create JSON: `{"token":"<hex>","createdAt":"<ISO-8601>","consumed":false}`
6. Write to `~/.halo2/admin-setup-token` with permissions `600`
7. Print output:

```
╔══════════════════════════════════════════════════════════╗
║  Halo Admin Setup Token Generated                       ║
╠══════════════════════════════════════════════════════════╣
║  Token:    a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0   ║
║            c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6            ║
║  Expires:  2026-05-30 20:05:00 UTC (5 minutes)          ║
║                                                         ║
║  Open in browser:                                       ║
║  http://localhost:8090/admin-setup?token=a1b2c3d4...    ║
║                                                         ║
║  Or from CLI:                                           ║
║  halo-admin.sh setup a1b2c3d4...                        ║
╚══════════════════════════════════════════════════════════╝
```

**Implementation notes:**
- Detect server host:port automatically from Halo config if possible, fallback to `localhost:8090`
- Use `sed` or `jq` for JSON generation; fallback to `printf` with manual escaping

#### Mode: `setup` — interactive

**Behavior:**
1. Accept token as first argument
2. Prompt for: Username, Email, Password, Confirm Password
3. Validate: username 4-63 chars, password 5-257 chars, email format
4. Confirm with user before sending
5. POST to `http://localhost:8090/admin-setup` (detect host from config; allow `HALO_URL` env override)
6. Print success or error

#### Mode: `setup` — non-interactive

**Behavior:**
1. Accept: `token username password [email]`
2. Validate inputs
3. POST to `http://localhost:8090/admin-setup`
4. Print success or error (non-zero exit on failure)

---

### 5.2 Token Store: `AdminSetupTokenStore.java`

#### Location

`run.halo.app.security.admin.AdminSetupTokenStore`

#### Class Design

```java
@Component
public class AdminSetupTokenStore {

    private static final String TOKEN_FILE = "admin-setup-token";
    private static final Duration TOKEN_TTL = Duration.ofMinutes(5);

    private final Path workDir;
    private final Path tokenFilePath;

    // in-memory cache (re-reads file on miss)
    private volatile TokenData cachedToken;

    record TokenData(String token, Instant createdAt, boolean consumed) {}

    // Read token from file
    public synchronized Mono<TokenData> readToken();

    // Validate and consume token
    public synchronized Mono<Void> validateAndConsume(String rawToken);
    // Returns Mono.error(InvalidTokenException) if:
    //   - file doesn't exist
    //   - token doesn't match (constant-time)
    //   - createdAt + 5 min < now
    //   - consumed == true
    // Otherwise: mark consumed = true, write to file

    public synchronized boolean isActive();
}
```

#### Key decisions

| Decision | Rationale |
|----------|-----------|
| JSON file on disk, not extension | File is available before extension system is fully initialized |
| File path: `~/.halo2/admin-setup-token` | Consistent with other Halo work-dir conventions |
| Permission: `600` | Only owner can read; prevents other system users from stealing token |
| Constant-time comparison | Prevents timing side-channel attacks on token validation |
| Synchronized methods | Single-threaded token validation; concurrent setup attempts race for consume |

#### Token validation logic (pseudocode)

```
validateAndConsume(rawToken):
    data = readTokenFromFile()
    if data == null:
        return error(403, "No setup token found. Run halo-admin.sh generate first.")
    if data.consumed:
        return error(403, "Token already consumed. Admin was already created.")
    if Instant.now() - data.createdAt > 5 min:
        return error(403, "Token expired (created at " + data.createdAt + ", max age 5 min)")
    if !constantTimeEquals(data.token, rawToken):
        return error(403, "Invalid token")
    
    data.consumed = true
    writeTokenToFile(data)
    return success()
```

---

### 5.3 Endpoint: `AdminSetupEndpoint.java`

#### Location

`run.halo.app.security.admin.AdminSetupEndpoint`

#### Routing

```java
@Component
@RequiredArgsConstructor
public class AdminSetupEndpoint {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 100)
    RouterFunction<ServerResponse> adminSetupRouter() {
        return SpringdocRouteBuilder.route()
            .GET("/admin-setup", this::setupPage,
                builder -> builder.operationId("AdminSetupPage")
                    .description("Render admin setup page")
                    .tag("SystemSetup"))
            .POST("/admin-setup", this::setup,
                builder -> builder.operationId("SetupAdmin")
                    .description("Create admin user with token")
                    .tag("SystemSetup"))
            .build();
    }
}
```

#### GET /admin-setup

**Purpose:** Render the admin setup HTML form

**Request:**
- Optional query param: `?token=abc123...` (pre-fills the token field)

**Response:**
- `200 OK` with `text/html` — renders `admin-setup.html`
- `302 Found` redirect to `/console` if setup already completed (check `SystemState.isSetup`)

**Logic:**
1. Check `initializationStateGetter.dataInitialized()` — if already set up, redirect to `/console`
2. Render `admin-setup.html`
3. Pass `token` from query param as model attribute for pre-fill

#### POST /admin-setup

**Purpose:** Create admin user with validated token

**Request:**
- `Content-Type: application/json`
- Body:
```json
{
    "token": "a1b2c3d4...",
    "username": "admin",
    "password": "myP@ssword",
    "email": "admin@example.com"
}
```

**Response codes:**

| Code | Condition |
|------|-----------|
| `204 No Content` | Admin created successfully |
| `400 Bad Request` | Validation errors in username/password/email |
| `403 Forbidden` | Token invalid, expired, or consumed |
| `409 Conflict` | Admin user already exists |

**Logic:**
1. Validate `SetupRequest` fields (username, password, email) using same validator as before
2. Call `adminSetupTokenStore.validateAndConsume(body.getToken())` — returns error mono if invalid
3. Call `superAdminInitializer.initialize(InitializationParam)` — creates user + role binding
4. Call `initializeNecessaryData(body.getUsername())` — loads preset extensions
5. Call `pluginService.installPresetPlugins()` — installs preset plugins
6. Call `themeService.installPresetTheme()` — installs preset theme
7. Call `SystemState.upsetSystemState(client, state -> state.setIsSetup(true))` — marks setup complete
8. Return `204 No Content`

**Reuse existing code:** Extract the initialization logic from `SystemSetupEndpoint.doInitialization()` into a shared package-private method, or inject `SystemSetupEndpoint` and call its method directly. Since both classes are in the same module, the cleanest approach is to extract a `SetupInitializationService`:

```java
@Service
public class SetupInitializationService {
    public Mono<Void> initialize(SetupRequest body) {
        // existing doInitialization logic
    }
}
```

Both `SystemSetupEndpoint` (before removal) and `AdminSetupEndpoint` would use this service.

---

### 5.4 Template: `admin-setup.html`

#### Location

`application/src/main/resources/templates/admin-setup.html`

#### Design

Thymeleaf template extending the same `gateway_fragments/layout` used by the old `setup.html`.

**Layout:**
- Halo logo at top
- Title: "Create Admin Account"
- Token field (text input) — pre-filled from `?token=` query param
- Username field (text, 4-63 chars, pattern validation)
- Email field (email, required)
- Password field (password, 5-257 chars, toggle visibility)
- Confirm password field
- Submit button: "Create Admin"
- Error message area (hidden by default, shown on error)

**JavaScript behavior:**
1. On page load, read `?token=` from URL and pre-fill token field
2. Client-side validation before submit
3. Submit via `fetch()` POST with `Content-Type: application/json`
4. On success (204): redirect to `/console`
5. On error: display error message in the error area (not an alert)

**Styling:** Reuse existing gateway CSS classes (`.gateway-wrapper`, `.halo-form-wrapper`, `.form-item`, `.form-input`, `.form-title`, `.alert`, `.alert-error`)

---

### 5.5 Modifications to Existing Files

#### 5.5.1 `AgentUserInitializer.java`

**Change:** Add `HIDDEN_USER_LABEL` to agent user metadata in `createAgentUser()`.

**Current code (line 60-78):**
```java
private Mono<User> createAgentUser(String username) {
    var metadata = new Metadata();
    metadata.setName(username);
    // no labels set
```

**Modified:**
```java
private Mono<User> createAgentUser(String username) {
    var metadata = new Metadata();
    metadata.setName(username);
    metadata.setLabels(Map.of(User.HIDDEN_USER_LABEL, "true"));
```

**Impact:**
- Agent users will no longer block `userInitialized()` check
- `DefaultInitializationStateGetter.hasUser()` already filters by `notEq(HIDDEN_USER_LABEL, "true")`
- Stats endpoint also filters hidden users

**Migration:** For existing agent users created without the label, add a reconciler or startup migration that patches existing agent users:
```java
// In AgentUserInitializer.run(), after ensuring agent users:
client.list(User.class, new ListOptions(), PageRequestImpl.ofSize(100))
    .flatMapMany(users -> Flux.fromIterable(users.getItems()))
    .filter(user -> user.getMetadata().getLabels() == null
        || !"true".equals(user.getMetadata().getLabels().get(User.HIDDEN_USER_LABEL)))
    .filter(user -> agentKeyService.listAgentUsernames().contains(user.getMetadata().getName()))
    .flatMap(user -> {
        if (user.getMetadata().getLabels() == null) {
            user.getMetadata().setLabels(new HashMap<>());
        }
        user.getMetadata().getLabels().put(User.HIDDEN_USER_LABEL, "true");
        return client.update(user);
    })
    .subscribe();
```

#### 5.5.2 `SystemSetupEndpoint.java`

**Changes:**
1. Remove the `POST /system/setup` route from `setupPageRouter()` builder
2. Remove the `GET /system/setup` route (or leave it to redirect to `/admin-setup`)
3. Keep the class if its helper methods are reused, or remove it entirely

**Recommendation:** Remove the entire class. Extract `doInitialization()` logic into `SetupInitializationService` (shared between old and new if needed for migration, but ultimately only `AdminSetupEndpoint` uses it).

If removing the class:
- Delete `SystemSetupEndpoint.java`
- Delete `setup.html`
- Ensure `SetupInitializationService` contains all necessary logic
- Check that no other code imports `SystemSetupEndpoint`
- Remove i18n messages specific to the old setup form (e.g., `title=Setup`, `form.*` keys in messages.properties) — but keep them if they might affect other pages

#### 5.5.3 `setup.html` — DELETE

Remove the entire file. Replaced by `admin-setup.html`.

---

## 6. Endpoint Reference

### Summary

| Method | Path | Auth | Content-Type | Purpose |
|--------|------|------|-------------|---------|
| `GET` | `/admin-setup` | None | `text/html` | Render setup form |
| `POST` | `/admin-setup` | None | `application/json` | Create admin user |

### Deprecated / Removed

| Method | Path | Reason |
|--------|------|--------|
| `GET` | `/system/setup` | Replaced by `/admin-setup` |
| `POST` | `/system/setup` | Replaced by token-gated flow |

---

## 7. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Token guessing** | 64-char hex token = 256 bits of entropy. Probability of guessing: ~2^-256 |
| **Token interception (MITM)** | Token is sent over HTTPS in production. Script runs locally on server. |
| **Token reuse after admin created** | Single-use: `consumed` flag prevents reuse |
| **Expired token reuse** | Server checks `createdAt + 5 min < now()` |
| **Timing attack on token comparison** | `MessageDigest.isEqual()` for constant-time comparison |
| **Token file readable by other users** | `chmod 600` restricts to owner |
| **Brute force POST /admin-setup** | Rate limiter on endpoint (add resilience4j config) |
| **CSRF on form** | `POST /admin-setup` accepts JSON only, not form-encoded. Token in body prevents CSRF. |
| **Setup after admin exists** | `SuperAdminInitializer` already handles `fetch + switchIfEmpty` |
| **Token file tampering** | File is on server filesystem; tampering requires shell access, which already grants full control |
| **Script output visible in shell history** | Token printed to stdout only; use `history -d` or pipe to `head -c 64` |

---

## 8. Edge Cases & Error Handling

| Scenario | Behavior | HTTP Code | Message |
|----------|----------|-----------|---------|
| No token file exists | Endpoint returns error | 403 | "No setup token found. Run `halo-admin.sh generate` on the server." |
| Token expired | Endpoint returns error | 403 | "Token expired. Generate a new one with `halo-admin.sh generate`." |
| Token already consumed | Endpoint returns error | 403 | "Token already used. Admin was already created." |
| Invalid token (wrong hex) | Endpoint returns error | 403 | "Invalid token." (no hint about why) |
| Username too short/long | Validation error | 400 | "Username must be 4-63 characters." |
| Password too short/long | Validation error | 400 | "Password must be 5-257 characters." |
| Invalid email format | Validation error | 400 | "Invalid email address." |
| Username already exists (admin re-creation) | Safe no-op | 204 | (user already exists, no error) |
| `generate` called while token active | Script error (without `--force`) | N/A | "Token already active (expires at ...). Use --force to overwrite." |
| `setup` called with wrong number of args | Script error | N/A | "Usage: halo-admin.sh setup <token> [<username> <password> [email]]" |
| Server not running | Script error | N/A | "Connection refused. Is the server running on localhost:8090?" |
| Token file permissions wrong | Script warns + creates | N/A | "Warning: token file has loose permissions. Setting to 600." |
| `HALO_URL` env var set | Script uses it instead of default | N/A | Uses `$HALO_URL/admin-setup` |
| Concurrent POST /admin-setup | First wins; second gets "consumed" | 403 | Race condition handled by synchronized token store |
| Server restarts during token window | Token file persists; still valid | N/A | File survives restart |
| Multiple agent users exist | All get `HIDDEN_USER_LABEL` | N/A | Handled by migration loop |
| Browser back button after setup | Redirect to /console | 302 | Smart redirect |

---

## 9. Testing Strategy

### Unit Tests

| Test Class | Tests |
|------------|-------|
| `AdminSetupTokenStoreTest` | `generate()`, `validateAndConsume()` valid token, expired token, consumed token, wrong token, constant-time comparison |
| `AdminSetupEndpointTest` | GET renders form, POST valid request, POST invalid token, POST expired token, POST validation errors |
| `AgentUserInitializerTest` (update) | Verify `HIDDEN_USER_LABEL` is set on agent users, verify existing agent users are patched on startup |

### Integration Tests

| Test Class | Tests |
|------------|-------|
| `AdminSetupIntegrationTest` | Full flow: generate token → POST to /admin-setup → verify user created → verify login works → verify setup page redirects |
| `AgentAuthIntegrationTest` (update) | Unaffected by changes; run to confirm |

### Script Tests

| Test | Command | Expected |
|------|---------|----------|
| Generate token | `halo-admin.sh generate` | Token file created, stdout contains token + URL |
| Generate twice | `halo-admin.sh generate` | Error: token already active |
| Generate with force | `halo-admin.sh generate --force` | Overwrites existing token |
| Interactive setup | `halo-admin.sh setup <token>` | Prompts for creds, POSTs to /admin-setup |
| Inline setup | `halo-admin.sh setup <token> admin pass123 admin@test.com` | POSTs without prompts |
| Missing token | `halo-admin.sh setup` | Shows usage error |

### Manual E2E

1. Stop running server if any
2. Start fresh server: `./gradlew :application:bootRun`
3. Run `halo-admin.sh generate`
4. Copy token from output
5. Open browser to `http://localhost:8090/admin-setup?token=<token>`
6. Fill form, submit
7. Verify redirect to `/console`
8. Verify login works with created credentials
9. Verify `/admin-setup` now redirects to `/console`

---

## 10. Implementation Order

Implementation must follow this exact order due to dependencies:

```
Phase 1: Infrastructure
  Step 1.1   Token Store         AdminSetupTokenStore.java       (no deps)
  Step 1.2   Setup Service       SetupInitializationService.java (extract from SystemSetupEndpoint)

Phase 2: Script
  Step 2.1   Shell Script        bin/halo-admin.sh               (tests against server)

Phase 3: Endpoint
  Step 3.1   Template            admin-setup.html                (HTML/CSS/JS)
  Step 3.2   Endpoint            AdminSetupEndpoint.java         (depends on 1.1, 1.2)

Phase 4: Cleanup
  Step 4.1   Agent User Fix      AgentUserInitializer.java       (add hidden label)
  Step 4.2   Remove Old          Delete SystemSetupEndpoint.java, setup.html
  Step 4.3   i18n Cleanup        Remove old setup form i18n keys

Phase 5: Testing
  Step 5.1   Unit Tests          TokenStore tests, Endpoint tests
  Step 5.2   Integration Tests   Full admin creation flow
  Step 5.3   Script Tests        Manual verification
```

---

## Appendix A: JSON Token File Schema

```json
{
    "$schema": "https://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["token", "createdAt", "consumed"],
    "properties": {
        "token": {
            "type": "string",
            "pattern": "^[0-9a-f]{64}$",
            "description": "64-character hex token generated by halo-admin.sh"
        },
        "createdAt": {
            "type": "string",
            "format": "date-time",
            "description": "ISO-8601 timestamp of token creation"
        },
        "consumed": {
            "type": "boolean",
            "description": "Whether this token has been used"
        }
    }
}
```

Example:
```json
{
    "token": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    "createdAt": "2026-05-30T20:00:00Z",
    "consumed": false
}
```

## Appendix B: Rate Limiting Configuration

Add to `application.yaml`:
```yaml
resilience4j.ratelimiter:
  configs:
    admin-setup:
      limitForPeriod: 3
      limitRefreshPeriod: 1h
      timeoutDuration: 0s
```

Applied via `@RateLimiter` on the `POST /admin-setup` handler. This prevents brute-force attempts on the token endpoint.

## Appendix C: i18n Messages

New keys for `admin-setup.html` (add to `config/i18n/messages.properties`):

```properties
admin-setup.title=Create Admin Account
admin-setup.token.label=Setup Token
admin-setup.token.placeholder=Paste your setup token
admin-setup.username.label=Username
admin-setup.username.placeholder=Choose a username
admin-setup.email.label=Email
admin-setup.email.placeholder=admin@example.com
admin-setup.password.label=Password
admin-setup.password.placeholder=Choose a strong password
admin-setup.confirm-password.label=Confirm Password
admin-setup.submit=Create Admin
admin-setup.error.token-invalid=Invalid or expired setup token. Run halo-admin.sh generate on the server.
admin-setup.error.token-consumed=Token already used. Admin was already created.
admin-setup.error.validation=Please fix the errors below.
admin-setup.success=Admin account created! Redirecting...
```
