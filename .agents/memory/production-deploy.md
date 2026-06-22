---
name: Production deployment workflow
description: This project's production is on Timeweb, not Replit. Replit is used only for development and improvement.
---

# Production deployment workflow

**Why:** The user explicitly stated this — Replit is the dev environment only. Production runs on a separate Timeweb server.

**Deploy chain:** Replit (develop & test) → GitHub (push) → Timeweb (git pull)

**How to apply:**
- Never look at Replit deployment logs to debug production issues — they won't exist.
- When user says "проблема на продакшене" ask them to describe the error or share logs from Timeweb, since we can't access that server.
- Always finish work fully and correctly here on Replit before the user pushes to GitHub.
- Env vars on Timeweb must be set separately — they do NOT sync from Replit automatically.
- This is a live production project serving real users. Every change must be thorough, tested, and complete. No quick hacks, no TODOs, no partial solutions.

## Schema drift = "column/relation does not exist" on prod

Some tables (e.g. `alif_payments`) are NOT in `migrations/` — they are created/updated only by `npx drizzle-kit push` from `shared/schema.ts`. `deploy.sh` runs that push in step 4/5.

**Symptom:** prod returns `column "X" of relation "Y" does not exist` (e.g. `booking_data` on `alif_payments`) while dev works fine.

**Cause:** prod was updated with a bare `git pull` (or `deploy.sh --skip-db`), so new code arrived but the DB schema was never synced.

**Fix (cannot reach Timeweb DB from Replit — give the user SQL to run there):** targeted, idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` (+ `DROP NOT NULL` where the new flow made a column optional) is safer on a live DB than a blanket `drizzle-kit push` (push can prompt/apply unexpected diffs). Then `pm2 restart nexttour`.

**Prevent:** always deploy via `./deploy.sh` (does git pull + install + build + drizzle-kit push + restart), never bare `git pull`.

## Build OOM on the Timeweb VPS

The Timeweb VPS is RAM-constrained: a prod `vite build` self-caps V8 heap (~489 MB) and dies with "JavaScript heap out of memory" at step 3/5 of `deploy.sh`. Dev on Replit (7.7 GB) builds fine, so this never reproduces here.

**Fix (both are needed together):**
1. One-time on the server: add swap (e.g. 2 GB `/swapfile` + fstab entry) — gives V8 memory to grow into.
2. Raise the heap limit only for the build: `NODE_OPTIONS="--max-old-space-size=2048"`. This is now baked into `deploy.sh` step 3 (inline, so it does NOT leak into the pm2 runtime). Raising the limit alone without swap just lets the OS OOM-killer fire; swap alone doesn't help because V8 self-caps — need both.

**Why:** small VPS, memory-heavy Rollup/Vite production build.
