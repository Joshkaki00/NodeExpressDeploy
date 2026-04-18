# Review Checklist

Run this before every commit. Check each item against the diff.

## Tests

- [ ] Run `npm test` — all 15 tests pass, 0 failures
- [ ] Any new feature has a failing test written before implementation
- [ ] New tests use `node:test` and `node:assert/strict` — no Jest, no Mocha

## Routes (`app.js`)

- [ ] Every handler returns `res.json(...)` — no `res.send()` with strings
- [ ] Missing required fields → `res.status(400).json({ error: "..." })`
- [ ] Successful POST creation → `res.status(201).json({ success: true, data: { ... } })`
- [ ] Body destructured as `const { field } = req.body || {}` — the `|| {}` guard is present

## Auth (`middleware/auth.js`)

- [ ] Auth applied per-route only — not via `app.use()`
- [ ] GET routes have no auth middleware attached
- [ ] Secret read from `process.env.JWT_SECRET` — no fallback, no hardcoded value

## ES Modules

- [ ] All local imports include `.js` extension
- [ ] No `require()` calls anywhere

## Security

- [ ] No secrets committed (no `.env` file, no hardcoded tokens or keys)
- [ ] `JWT_SECRET` is never logged or returned in a response

## Docs

- [ ] `CLAUDE.md` file paths still accurate (not stale)
- [ ] `AGENTS.md` "What Lives Here" matches actual file structure
