# TravelPro — Replit.md

## ВАЖНО — Рабочий процесс

**Цепочка деплоя: Replit → GitHub → Timeweb (продакшн)**

1. Код улучшается и тестируется здесь, на Replit
2. Изменения пушатся в репозиторий на GitHub
3. На сервере Timeweb делается `git pull` — и продакшн обновляется

Этот сайт — живой продакшн-проект. Домен подключён к серверу Timeweb.

- **Каждая задача требует максимально качественного, полного и ответственного выполнения**
- Никаких временных заглушек, половинчатых решений или "потом доделаем"
- Перед любым изменением — понять последствия. Протестировать результат.
- База данных на продакшене реальная — любые миграции схемы проводить с осторожностью
- Код должен быть чистым, предсказуемым и поддерживаемым
- **Переменные окружения на Timeweb нужно настраивать отдельно** — они не синхронизируются с Replit автоматически

---

## Overview

TravelPro is a bilingual (Russian/English) travel booking platform. It lets users browse tours, view promotions and news, make bookings, and manage their profile with a loyalty system. Admins get a full dashboard to manage tours, bookings, reviews, users, banners, hero slides, news, and more.

Key pages:
- **Public**: Home (hero slider, featured tours), Tours (search/filter), Tour Detail, Promotions, News, About
- **User**: Profile (bookings, favorites, loyalty level), Payment Result (`/payment/result?orderId=...`)
- **Admin**: Dashboard, Tours (with Dates/Options/Itinerary/Pricing sub-tabs), Bookings, Reviews, Users, Countries, Categories, Feeds, News, Banners, Hero Slides, Intro Screen, Currencies, Email Broadcasts

The app is a monorepo with a React frontend, an Express backend, and a shared schema. Everything runs in a single Node.js process in development.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (React + Vite)

- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State/data fetching**: TanStack React Query — all API calls go through `apiRequest()` in `client/src/lib/queryClient.ts`; query keys are the API URL strings
- **UI components**: shadcn/ui (Radix UI primitives + Tailwind CSS), "new-york" style variant
- **Styling**: Tailwind CSS with custom CSS variables for theming (light mode defined in `client/src/index.css`); dark mode ready via `darkMode: ["class"]`
- **Internationalization**: Custom `I18nProvider` in `client/src/lib/i18n.tsx` — stores `"ru"` or `"en"` in `localStorage`, exposes a `t(ru, en)` helper used throughout all components. All bilingual content is stored in the database as `nameRu`/`nameEn` pairs.
- **Auth context**: `AuthProvider` in `client/src/lib/auth.tsx` wraps the app; uses `/api/auth/me` to check session, exposes `login`, `register`, `logout` mutations.
- **Entry point**: `client/src/main.tsx` → `App.tsx` wraps everything in `QueryClientProvider`, `I18nProvider`, `AuthProvider`, `TooltipProvider`, and `Toaster`.

### Backend (Express + Node.js)

- **Framework**: Express.js, TypeScript, runs via `tsx` in development
- **Session auth**: `express-session` with `connect-pg-simple` (sessions stored in Postgres). `passport-local` strategy authenticates via email + bcrypt password.
- **Roles**: Two roles — `"user"` and `"admin"`. Middleware guards `requireAuth` and `requireAdmin` protect routes.
- **Storage layer**: All DB access goes through `server/storage.ts` which exports an `IStorage` interface implemented with Drizzle ORM queries. This pattern makes it easy to swap storage implementations.
- **Routes**: Registered in `server/routes.ts`; covers auth, tours, bookings, reviews, countries, cities, categories, banners, feeds, news, favorites, hero slides, intro screen, and admin endpoints.
- **Static serving**: In production, Express serves the Vite build from `dist/public`. In development, Vite middleware is used via `server/vite.ts`.
- **Build**: `script/build.ts` runs both `vite build` (client) and `esbuild` (server) to produce `dist/` artifacts.

### Data Storage

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (`drizzle-orm/node-postgres`) with schema defined in `shared/schema.ts`
- **Schema highlights**:
  - `users` — roles (`user`/`admin`), loyalty levels (`beginner`/`traveler`/`premium`), booking count, discounts
  - `tours` — bilingual titles/descriptions, price, discount percent, hot flag, images (JSON array), country/city/category FK
  - `tourDates`, `priceComponents`, `tourPriceComponents`, `tourOptions`, `tourItinerary` — detailed tour data
  - `banners`, `heroSlides`, `introScreen` — CMS-style content
  - `currencies` — multi-currency support (code, symbol, rateToBase, isBase flag). Base currency is TJS (Somoni). Prices stored in TJS, converted client-side via `CurrencyProvider` + `useCurrency()` hook in `client/src/lib/currency.tsx`
  - `tourFeeds`, `tourFeedItems` — curated collections of tours
  - `reviews` — with approval status (`pending`/`approved`/`rejected`)
  - `bookings` — status flow (`new`→`prepaid`→`paid`/`cancelled`), payment type
  - `favorites` — user ↔ tour many-to-many
  - `news` — bilingual articles
- **Migrations**: Drizzle Kit (`drizzle-kit push` / `migrations/` directory)
- **Seeding**: `server/seed.ts` inserts demo data (admin user, sample tours, countries, etc.) on first run

### Authentication & Authorization

- Session-based (not JWT). Sessions persisted in Postgres via `connect-pg-simple`.
- Passwords hashed with bcryptjs.
- `passport-local` handles login. Session cookie is HTTP-only, 30-day max age.
- Admin routes require `role === "admin"` check server-side.

### Shared Code

- `shared/schema.ts` is imported by both client and server. The client gets TypeScript types for free; the server uses actual Drizzle table objects for queries.
- Path alias `@shared/*` resolves to `./shared/` in both Vite and TypeScript configs.

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| **PostgreSQL** | Primary database (requires `DATABASE_URL` env var) |
| **Drizzle ORM** | Type-safe SQL ORM and schema management |
| **express-session + connect-pg-simple** | Server-side session storage in Postgres |
| **passport / passport-local** | Authentication middleware |
| **bcryptjs** | Password hashing |
| **TanStack React Query** | Client-side server state management |
| **Radix UI / shadcn/ui** | Accessible, unstyled UI primitives |
| **Tailwind CSS** | Utility-first CSS framework |
| **wouter** | Lightweight React router |
| **Vite** | Frontend build tool and dev server |
| **date-fns** | Date formatting |
| **zod + drizzle-zod** | Schema validation (shared between client and server) |
| **Google Fonts** | DM Sans, Fira Code, Geist Mono (loaded in `client/index.html`) |
| **@replit/vite-plugin-runtime-error-modal** | Dev-time error overlay (Replit-specific) |
| **@replit/vite-plugin-cartographer** | Replit dev tooling |

### Environment Variables Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for signing session cookies (falls back to a hardcoded default) |
| `SENDGRID_API_KEY` | SendGrid API key for sending emails |
| `SENDGRID_FROM_EMAIL` | Verified sender email address in SendGrid |
| `ALIF_TERMINAL_ID` | Alif Bank acquiring terminal ID (key) |
| `ALIF_TERMINAL_PASSWORD` | Alif Bank acquiring terminal password |
| `ALIF_TEST_MODE` | Set to `"false"` for production, omit or `"true"` for test env |

### Alif Acquiring Payment Flow

- `server/payment.ts` — HMAC SHA256 token generation + Alif API calls
- `POST /api/payments/initiate` — Creates Alif payment session, returns redirect URL
- `POST /api/payments/callback` — Public endpoint, receives Alif status callbacks, updates booking status
- `GET /api/payments/booking/:bookingId` — Get payment record for a booking
- `GET /api/payments/order/:orderId` — Get payment status by orderId (used by result page)
- DB table: `alif_payments` (tracks all payment attempts)
- After booking creation in `BookingModal`, user is shown a payment choice screen with 4 payment methods (Korti Milli, Alif Mobi, Salom installment, Cash invoice)
- After payment, Alif redirects to `/payment/result?orderId=...`