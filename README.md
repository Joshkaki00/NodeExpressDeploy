# Fixthis — Express.js Starter (JWT Auth)

Brownfield exercise: explore an unfamiliar Express 5 codebase, document it, then ship JWT authentication middleware without breaking existing behavior.

## Project

**Chosen path:** Express.js Starter — add authentication middleware with JWT

**Codebase:** [`NodeExpressDeploy/`](./NodeExpressDeploy/) — a minimal JSON API with 4 routes, deployed on Vercel.

## Quickstart

```bash
cd NodeExpressDeploy
npm install
npm start          # http://localhost:8080
npm test           # run test suite
```

## Routes

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| GET | `/` | No | Welcome message |
| GET | `/about` | No | About info |
| GET | `/contact` | No | Usage instructions |
| POST | `/contact` | Yes (JWT) | Submit contact form |

## Feature: JWT Auth Middleware

POST `/contact` requires a valid JWT in the `Authorization: Bearer <token>` header. See [`NodeExpressDeploy/middleware/auth.js`](./NodeExpressDeploy/middleware/auth.js) for implementation and [`NodeExpressDeploy/AGENTS.md`](./NodeExpressDeploy/AGENTS.md) for agent-scoped instructions.

## Deploy

Vercel config in [`NodeExpressDeploy/vercel.json`](./NodeExpressDeploy/vercel.json). Set `JWT_SECRET` as an environment variable before deploying.
