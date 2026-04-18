# writeup.md — Exploration, Tuning, and Results

## V1.0 — Exploration

### How I Explored

Used Cursor agent scan of the full workspace. No files read manually before running the agent — intentional, to simulate real brownfield drop-in.

### What I Found

**Codebase snapshot (April 17, 2026):**

- `NodeExpressDeploy/index.js` — 55 lines, all route logic, no separate modules
- One dependency: `express ^5.2.1` (ES modules, `"type": "module"`)
- No tests — `npm test` exits with error immediately
- Vercel deployment config uses `@vercel/node` with a catch-all route to `index.js`
- Nested `.git` inside `NodeExpressDeploy/` — this is a fork of an upstream repo, not a subtree

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
- `NodeExpressDeploy/AGENTS.md` — scoped: route conventions, middleware pattern, import rules, test rules, what not to do

---

## V1.1 — Rules & Context Tuning

### Rules Written

3 Cursor rules created in `.cursor/rules/`:

1. **`es-modules.mdc`** — glob: `NodeExpressDeploy/**/*.js` — enforces `.js` extension on local imports, bans `require()`
2. **`json-responses.mdc`** — glob: `NodeExpressDeploy/**/*.js` — enforces JSON-only responses, 400/201 status conventions
3. **`tests-first.mdc`** — glob: `NodeExpressDeploy/tests/**` — enforces `node:test` + `node:assert`, test-before-implementation order, no Jest/Mocha

### Testing Rules

Ran a small agent task: "Add a new GET /status route." Observed:
- Without rules: agent used `res.send()` (wrong), no test written first
- With rules: agent used `res.json()`, wrote test file first using `node:test`

### Refinements

- Added "What Not To Do" section to `NodeExpressDeploy/AGENTS.md` after observing agent try to move `app.listen()` into a conditional
- Kept `CLAUDE.md` under 60 lines — removed an early draft section that listed all route return shapes (too much detail, went stale immediately)

---

## V1.2 — Feature Addition

### Feature: JWT Auth on POST /contact

**Spec:** See `NodeExpressDeploy/middleware/auth.js` and `NodeExpressDeploy/tests/auth.test.js`.

**Acceptance criteria:**
- `POST /contact` with valid `Authorization: Bearer <token>` → 201 (existing behavior unchanged)
- `POST /contact` with missing or malformed header → 401 `{ error: "Unauthorized" }`
- `POST /contact` with expired or invalid signature → 401 `{ error: "Unauthorized" }`
- All other routes (`GET /`, `GET /about`, `GET /contact`) unaffected — no auth required
- `JWT_SECRET` read from environment, never hardcoded

**Approach:** Test-first. Wrote failing tests in `tests/auth.test.js` before touching `index.js` or creating `middleware/auth.js`.

**Result:** All characterization tests (existing routes) pass. All new auth tests pass.
