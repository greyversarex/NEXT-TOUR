---
name: Site documents feature
description: How admin-managed downloadable legal documents behave (offer/privacy/terms + custom).
---

Admins upload/replace downloadable document files (PDF/Word/Excel) that back the "открыть документ" buttons across the site. Backed by the `documents` table, not the generic settings store.

**System vs custom docs.** `offer`, `privacy`, `terms` are `isSystem: true`, idempotently seeded on every startup. They cannot be deleted and their slug cannot change (fixed site routes `/offer`, `/privacy`, `/terms` reference the slug). Admins can only replace the file, edit titles/descriptions, hide, or reorder them. Custom docs are fully CRUD.

**Fallback rule (DocumentPage).** `/offer|/privacy|/terms` render the uploaded file (PDF iframe + download) when `fileUrl` is set; when active with no file they fall back to the original hardcoded legal text. When the doc is *hidden* the public `GET /api/documents/:slug` returns 404 ("Document not found") and the page must show "unavailable" — NOT the fallback text — so the hide toggle is respected. Transient/non-404 errors still fall through to the legal text so it stays reachable.
**Why:** hiding a doc must actually remove it from the site, but an API outage must not wipe legally-required text.

**Dead-link guard.** Footer + About only list a doc when `doc.fileUrl || doc.isSystem`. A custom doc without a file has no page route (`/${slug}` 404s), so linking it would be a dead link.

**Upload gating.** `POST /api/upload` allows images/video for any authenticated user but restricts office/PDF document types to `role === "admin"` (checked in multer `fileFilter` via `req.user`). Prevents non-admins hosting arbitrary office files on public `/uploads/*`.

Schema changes ship via `db:push` (project has no `migrate` script; the `migrations/` folder is just the initial snapshot) — same convention as the vehicles feature.
