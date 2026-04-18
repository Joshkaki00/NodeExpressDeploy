# AGENTS.md — middleware/

Scoped instructions for any agent working inside this directory.

## What Lives Here

Express middleware functions. Currently one file: `auth.js` — a JWT Bearer token verifier applied per-route on `POST /contact`.

## Before You Touch Code

1. Read `auth.js` in full — it's under 25 lines
2. Run `npm test` from the project root and confirm all 15 tests pass before making any change
3. Check the auth test file at `tests/auth.test.js` — it fully specifies the expected behavior

## Middleware Conventions

- Signature: `(req, res, next)` — always all three params
- On success: call `next()` and return nothing
- On failure: `return res.status(401).json({ error: 'Unauthorized' })` — always return to stop execution
- Read secrets from `process.env.*` only — never hardcode
- One concern per file — don't combine unrelated middleware logic

## Auth Middleware Specifics

- Header: `Authorization: Bearer <token>`
- Split on a single space: `const [scheme, token] = header.split(' ')`
- Reject if `scheme !== 'Bearer'` or `!token`
- Verify with `jwt.verify(token, process.env.JWT_SECRET)` — any exception → 401
- Secret key: `process.env.JWT_SECRET` — must be set in the environment; never use a fallback default

## Import Pattern

```js
import authMiddleware from './middleware/auth.js'
// Apply per-route, not globally:
app.post('/contact', authMiddleware, handler)
```

## What Not To Do

- Do not apply auth globally with `app.use()` — GET routes are intentionally public
- Do not swallow errors silently — any `jwt.verify` failure must return 401
- Do not add a fallback secret (e.g. `|| 'secret'`) — fail closed if `JWT_SECRET` is unset
- Do not add new middleware files without a corresponding test file in `tests/`
