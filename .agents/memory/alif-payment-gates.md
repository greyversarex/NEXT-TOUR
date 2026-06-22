---
name: Alif payment gates
description: How card-brand selection maps to Alif's `gate` parameter, and that all gates use the same acquiring endpoint.
---

# Alif `gate` parameter selects the card brand

Alif acquiring uses a single `gate` field to pick the payment method/brand. Known codes:
- `vsa` — Visa
- `mcr` — Mastercard
- `km` — Korti Milli (Tajik national card)

**Why:** Alif enabled Visa/Mastercard acceptance and instructed us to send `gate="vsa"` /
`gate="mcr"`. The client lets the user pick the brand; the chosen `gate` is sent to
`POST /api/payments/initiate`, stored on the `alif_payments` row, and forwarded to Alif.

**How to apply:**
- All gates hit the **same** acquiring endpoint (`/v2/`); `gate` (sent in both the HTTP header
  and JSON body) is what routes to the correct hosted card-entry page. There is no separate API
  URL per brand — "отдельная страница" from Alif means the hosted payment page, not a different
  endpoint.
- The backend is brand-agnostic: it just passes through whatever `gate` it receives (default
  `vsa`). To add/remove a brand, change the selector in the booking modal — no server change.
