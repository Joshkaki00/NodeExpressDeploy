# CLAUDE.md — fixthis / NodeExpressDeploy

## What This Project Is

Minimal Express 5 JSON API. Four routes, one file, deployed on Vercel. The feature target is JWT authentication middleware on POST /contact.

## Tech Stack

- Node.js with ES modules (`"type": "module"` — use `import`, never `require`)
- Express 5 (`^5.2.1`)
- Vercel serverless deployment
- Test framework: Node.js built-in `node:test` + `node:assert`

## Key Files

- Server entry (listen only): `index.js`
- Express app + all routes: `app.js`
- JWT auth middleware: `middleware/auth.js`
- Tests: `tests/`
- Deployment config: `vercel.json`
- Dependency manifest: `package.json`

## Conventions

- All responses are JSON — no HTML, no templates
- Validation pattern: destructure `req.body || {}`, return `400` with `{ error: "..." }` if fields missing
- Success on POST: `201` with `{ success: true, data: { ... } }`
- Port: `process.env.PORT || 8080`
- Secret: `process.env.JWT_SECRET` — never hardcode

## Gotchas

- ES modules only — file extensions required in local imports (`import './middleware/auth.js'`)
- Vercel uses `app.listen()` in this config (not a handler export) — don't change that pattern
- Express 5 handles async errors natively; no need for `try/catch` wrappers in route handlers
- `node_modules/` is gitignored inside `NodeExpressDeploy/` — run `npm install` before any test run

## Commands

```bash
cd NodeExpressDeploy
npm start          # start server
npm test           # run tests
```

## Agent Scope

For route and middleware work, read `.claude/AGENTS.md` first.
