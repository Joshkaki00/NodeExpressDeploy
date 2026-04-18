# AGENTS.md — NodeExpressDeploy/

Scoped instructions for any agent working inside this directory.

## What Lives Here

Single-file Express 5 JSON API. All routes in `index.js`. JWT middleware lives in `middleware/auth.js`. Tests in `tests/`.

## Before You Touch Code

1. Read `index.js` in full — it's 55 lines, no excuse to skip it
2. Run `npm test` and confirm baseline before making any change
3. Check `CLAUDE.md` at repo root for project-wide conventions

## Route Conventions

- Every handler returns JSON — no `res.send()` with plain strings
- Destructure body as `const { field } = req.body || {}` — the `|| {}` guard is intentional
- Missing required fields → `res.status(400).json({ error: "..." })`
- Successful POST creation → `res.status(201).json({ success: true, data: { ... } })`
- No try/catch needed in route handlers — Express 5 catches async errors automatically

## Middleware Conventions

- Middleware files go in `middleware/`
- Auth middleware signature: `(req, res, next)` — call `next()` on success, `res.status(401).json(...)` on failure
- Read the JWT secret from `process.env.JWT_SECRET` only — never hardcode
- Apply middleware per-route, not globally: `app.post('/contact', authMiddleware, handler)`

## Import Rules

- ES modules only — always include `.js` extension on local imports
- Example: `import authMiddleware from './middleware/auth.js'`

## Testing Rules

- Tests use Node.js built-in `node:test` and `node:assert` — no Jest, no Mocha
- Write the failing test before writing any implementation
- Characterization tests for existing routes go in `tests/routes.test.js`
- Auth middleware tests go in `tests/auth.test.js`
- Run tests with `npm test`

## What Not To Do

- Do not add a test framework via npm — use `node:test`
- Do not move `app.listen()` out of `index.js` or wrap it in a conditional — Vercel handles this as-is
- Do not rename `index.js` — Vercel's build config points to it directly
- Do not add HTML responses or a view engine
