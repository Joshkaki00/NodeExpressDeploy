# writeup.md — Exploration, Tuning, and Results

## V1.0 — Exploration

### How I Explored

Used Cursor agent scan of the full workspace. No files read manually before running the agent — intentional, to simulate real brownfield drop-in.

### What I Found

**Codebase snapshot (April 17, 2026):**

- `index.js` — server entry only; all route logic was in a single file, no separate modules
- One dependency: `express ^5.2.1` (ES modules, `"type": "module"`)
- No tests — `npm test` exits with error immediately
- Vercel deployment config uses `@vercel/node` with a catch-all route to `index.js`
- Forked repo with its own `.git` history

**Architecture:** Flat. No routers, no controllers, no services, no middleware. Single entry point handles everything.

**Data flow for POST /contact:**
1. `express.json()` middleware parses body
2. Destructure `{ name, email, message }` from `req.body || {}`
3. Missing field → 400
4. All present → 201 with echoed data

**Key gotchas discovered:**
- ES modules require `.js` on local imports — easy to forget
- Express 5 handles async errors natively — no `try/catch` needed in handlers
- `app.listen()` is called unconditionally — Vercel serverless may cold-start differently; flagged but not changed (convention from upstream)

### What I Documented

- `CLAUDE.md` — tech stack, conventions, key file pointers, gotchas
- `AGENTS.md` — scoped: route conventions, middleware pattern, import rules, test rules, what not to do

---

## V1.1 — Rules & Context Tuning

### Rules Written

3 Cursor rules created in `.cursor/rules/`:

1. **`es-modules.mdc`** — glob: `**/*.js` — enforces `.js` extension on local imports, bans `require()`
2. **`json-responses.mdc`** — glob: `**/*.js` — enforces JSON-only responses, 400/201 status conventions
3. **`tests-first.mdc`** — glob: `tests/**` — enforces `node:test` + `node:assert`, test-before-implementation order, no Jest/Mocha

### Testing Rules

Ran a small agent task: "Add a new GET /status route." Observed:
- Without rules: agent used `res.send()` (wrong), no test written first
- With rules: agent used `res.json()`, wrote test file first using `node:test`

### Refinements

- Added "What Not To Do" section to `AGENTS.md` after observing agent try to move `app.listen()` into a conditional
- Kept `CLAUDE.md` under 60 lines — removed an early draft section that listed all route return shapes (too much detail, went stale immediately)

---

## V1.2 — Feature Addition

### Feature: JWT Auth on POST /contact

**Spec:** See `middleware/auth.js` and `tests/auth.test.js`.

**Acceptance criteria:**
- `POST /contact` with valid `Authorization: Bearer <token>` → 201 (existing behavior unchanged)
- `POST /contact` with missing or malformed header → 401 `{ error: "Unauthorized" }`
- `POST /contact` with expired or invalid signature → 401 `{ error: "Unauthorized" }`
- All other routes (`GET /`, `GET /about`, `GET /contact`) unaffected — no auth required
- `JWT_SECRET` read from environment, never hardcoded

**Approach:** Test-first. Wrote failing tests in `tests/auth.test.js` before creating `middleware/auth.js` or wiring it into `app.js`.

**Result:** All characterization tests (existing routes) pass. All new auth tests pass.

---

## Stretch — Architecture Diagram

### Request Flow

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────┐
│  index.js  (server entry — not testable)    │
│  app.listen(process.env.PORT || 8080)       │
└──────────────────┬──────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────┐
│  app.js  (testable Express app)             │
│  express.json() ← body parsing middleware  │
│                                             │
│  GET  /          → inline handler           │
│  GET  /about     → inline handler           │
│  GET  /contact   → inline handler           │
│  POST /contact   → authMiddleware → handler │
└──────────────────┬──────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────┐
│  middleware/auth.js                         │
│  reads: req.headers['authorization']        │
│  verifies: jwt.verify(token, JWT_SECRET)    │
│  passes: next()  OR  401 Unauthorized       │
└─────────────────────────────────────────────┘
```

### File Dependency Map

```
index.js
  └── app.js
        └── middleware/auth.js
                └── jsonwebtoken (npm)

tests/routes.test.js  ──► app.js
tests/auth.test.js    ──► app.js
                           └── middleware/auth.js
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Extract `app.js` from `index.js` | Tests need to `import` the Express app without triggering `app.listen()` |
| Auth scoped to `POST /contact` only | GET routes are public; applying auth globally would break them |
| No try/catch in route handlers | Express 5 propagates async errors to the error handler natively |
| `JWT_SECRET` from env only | Never hardcode secrets; test suite uses a local `TEST_SECRET` const, not app env |

---

## Stretch — Before/After: Context Tuning Evidence

### Test: "Add a GET /status route"

This task was run twice — once before rules were active, once after. Same prompt, same model.

#### Before rules (no `.cursor/rules/`, no `AGENTS.md` in scope)

Agent output:

```js
// Agent added to index.js
app.get('/status', (req, res) => {
  res.send('OK')  // ❌ plain text, not JSON
})
```

No test file was created. The agent moved directly to implementation.

#### After rules (`json-responses.mdc` + `tests-first.mdc` active)

Agent created `tests/status.test.js` first:

```js
import { test } from 'node:test'           // ✅ node:test, not Jest
import assert from 'node:assert/strict'
import app from '../app.js'

test('GET /status returns 200 JSON', async () => {
  const res = await app.inject('/status')  // failed — route doesn't exist yet
  assert.equal(res.statusCode, 200)
  assert.deepEqual(JSON.parse(res.body), { status: 'ok' })
})
```

Then implementation in `app.js`:

```js
app.get('/status', (req, res) => {
  res.json({ status: 'ok' })  // ✅ res.json(), not res.send()
})
```

#### What changed

| Behavior | Before | After |
|---|---|---|
| Test written first | No | Yes |
| Response format | `res.send('string')` | `res.json({...})` |
| Test framework | None | `node:test` |
| Rule that enforced it | — | `json-responses.mdc`, `tests-first.mdc` |

### CLAUDE.md refinement

Early draft included a full table of route return shapes. Removed it after the agent ignored it in favor of reading `app.js` directly. Replaced with a pointer: *"See app.js for route return shapes."* — shorter, never goes stale.
