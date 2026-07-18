---
name: Upload image compression
description: Server auto-compresses uploaded images; SVG uploads rejected; uploads served with hardened headers.
---

Rule: all raster image uploads through the app's upload endpoint are auto-compressed server-side (sharp: EXIF-rotate, max 1920px, WebP) and the compressed file is kept only if smaller. GIF (animation) and video pass through untouched. SVG uploads are rejected entirely.

**Why:** admins were uploading multi-MB photos for the welcome/intro background, making the site load slowly for visitors; SVG served same-origin is a stored-XSS vector.

**How to apply:** never bypass the upload endpoint with raw file writes; if adding new upload paths, apply the same compression + SVG rejection. `/uploads` and prod static assets are served with long Cache-Control (30d) and `X-Content-Type-Options: nosniff` + `CSP: sandbox` on uploads — keep those headers when touching static serving.
