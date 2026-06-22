---
name: Booking creation flow
description: Bookings are created only after successful payment, never before — the contract that keeps unpaid garbage out of the system.
---

# Bookings are payment-gated

A booking row must only come into existence once a payment has actually succeeded.

**Why:** Previously bookings were created up-front with status `new`, so abandoned/unpaid
attempts piled up and cluttered users' profiles and admin lists. The user explicitly asked
that a booking NOT exist until payment goes through.

**How to apply:**
- The public booking path goes through the Alif payment flow only: `POST /api/payments/initiate`
  stores the pending booking payload (no booking created) and the `/api/payments/callback`
  creates the real booking on success.
- `POST /api/bookings` is **admin-only** (`requireAdmin`). Do not reopen it to the public —
  that would reintroduce the unpaid-garbage surface.
- Booking creation in the callback is atomic and row-locked (`createBookingForPayment` uses a
  DB transaction with `SELECT ... FOR UPDATE` on the `alif_payments` row, only creating when
  `booking_id IS NULL`). Keep it that way so repeated/concurrent Alif callbacks can never create
  duplicate bookings.
- Profile "Bookings" tab shows only `paid`/`prepaid` (real, paid bookings).

**Known follow-up (not done):** the payment callback still processes a status even when Alif
sends no verification token (pre-existing). Hardening that (mandatory token / server-side status
check) is a separate security decision because it could break the live Alif flow — flag to the
user before changing.
