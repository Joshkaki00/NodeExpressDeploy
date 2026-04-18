# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Minimal Express 5 JSON API. Four routes deployed on Vercel. JWT authentication middleware protects `POST /contact`.

## Tech Stack

- Node.js with ES modules (`"type": "module"` — use `import`, never `require`)
- Express 5 (`^5.2.1`)
- `jsonwebtoken` (`^9.0.3`) for JWT signing/verification
- Vercel serverless deployment
- Test framework: Node.js built-in `node:test` + `node:assert`

## Key Files

- Server entry (listen only): `index.js`
- Express app + all routes: `app.js`
- JWT auth middleware: `middleware/auth.js`
- Tests: `tests/`
- Deployment config: `vercel.json`

## Commands

```bash
npm start                              # start server
npm test                               # run all tests
node --test tests/auth.test.js         # run a single test file
```

`JWT_SECRET` must be set in the environment before starting the server. Tests set it themselves in `before()`.

## Conventions

- All responses are JSON — no HTML, no templates
- Validation pattern: destructure `req.body || {}`, return `400` with `{ error: "..." }` if fields missing
- Success on POST: `201` with `{ success: true, data: { ... } }`
- Port: `process.env.PORT || 8080`

## Architecture

`index.js` only calls `app.listen()`. The Express app and all routes live in `app.js` so tests can import the app directly without binding a port. Tests use `app.listen(0)` to get a random available port, avoiding conflicts between test files.

Auth middleware is applied per-route (`app.post('/contact', authMiddleware, handler)`), not globally — GET routes are intentionally public.

## Gotchas

- ES modules only — file extensions required in local imports (`import './middleware/auth.js'`)
- Vercel uses `app.listen()` in this config (not a handler export) — don't change that pattern
- Express 5 handles async errors natively; no need for `try/catch` wrappers in route handlers
- `node_modules/` is gitignored — run `npm install` before any test run

## Agent Scope

For route and middleware work, read `AGENTS.md` first.
