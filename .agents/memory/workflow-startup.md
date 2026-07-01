---
name: Workflow startup & server reloads
description: How the dev workflow starts and why server-side code changes need a manual restart
---

# Workflow startup

- The dev workflow runs `tsx server/index.ts` (via `npm run dev`) serving on port 5000. If invoking tsx directly, use `npx tsx` because `node_modules/.bin` is not on PATH by default.

# Server changes require a manual restart

- The `tsx` server process runs **without watch mode**. Vite HMR only reloads the **client** (`client/src/**`).
- Any change to server-side or shared code — `server/*.ts`, `shared/schema.ts` (Zod schemas, routes, storage) — will NOT take effect until the "Start application" workflow is restarted.
- **Why:** silently running stale server code caused a confusing failure — a Zod email-validation change appeared broken (bad input returned 201 instead of 400) simply because the old routes/schema were still in memory. Restarting the workflow fixed it.
- **How to apply:** after editing any server or shared file, restart the workflow before testing the endpoint. Do not conclude a server-side fix is wrong until you have restarted.
