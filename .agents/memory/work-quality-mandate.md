---
name: Work quality mandate
description: Non-negotiable quality rules for every task on this project (nexttour.tj).
---

# Work Quality Mandate — nexttour.tj

This is a live production travel booking platform. Every task — no matter how small — must be treated as critical.

## Rules (apply to every session, every task)

1. **Study before touching.** Before changing any file, read the relevant code carefully to understand how it works and what else depends on it. Never guess or skim.
2. **No superficial work.** Every task must be completed fully and correctly. No half-solutions, no TODOs left in code, no placeholders.
3. **Test consequences.** After any change, think through what other features could be affected. Check them.
4. **No silent fallbacks.** Code must fail explicitly, not silently degrade.
5. **Quality over speed.** Taking extra time to do it right is always preferred over a fast but flawed result.

## Deployment chain

Replit (dev + testing) → GitHub (push) → Timeweb server (git pull = production update).

**Why:** The owner has explicitly stated this site is extremely important and demands full responsibility on every task without exception.

**How to apply:** Before starting any task — read the affected files, understand the full picture, then implement completely and verify the result.
