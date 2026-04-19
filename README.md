# Fixthis — Express.js Starter (JWT Auth)

Brownfield exercise: explore an unfamiliar Express 5 codebase, document it, then ship JWT authentication middleware without breaking existing behavior.

## Project

**Chosen path:** Express.js Starter — add authentication middleware with JWT

**Codebase:** Minimal JSON API with 4 routes, deployed on Vercel.

## Quickstart

```bash
npm install
npm start          # http://localhost:8080
npm test           # run test suite
```

Set `JWT_SECRET` in your environment before starting the server. Tests set it themselves.

## Routes

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| GET | `/` | No | Welcome message |
| GET | `/about` | No | About info |
| GET | `/contact` | No | Usage instructions |
| POST | `/contact` | Yes (JWT) | Submit contact form |

## Feature: JWT Auth Middleware

`POST /contact` requires a valid JWT in the `Authorization: Bearer <token>` header. See [`middleware/auth.js`](./middleware/auth.js) for implementation and [`AGENTS.md`](./AGENTS.md) for agent-scoped instructions.

## Deploy

Vercel config in [`vercel.json`](./vercel.json). Set `JWT_SECRET` as an environment variable in the Vercel dashboard before deploying.
