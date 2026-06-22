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
