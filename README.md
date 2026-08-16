# ESNTL — Everything in one Basket

A subscription marketplace built around **Baskets**: customers build a
Basket once, subscribe to it, and ESNTL coordinates recurring deliveries
from multiple businesses. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for the full product/technical design (MVP scope, database schema, user
flows, admin architecture, and UI system).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** — Postgres, Auth, Row Level Security
- Payment layer abstracted behind `src/lib/payments` (mock provider today,
  a Nigerian provider such as Paystack/Flutterwave can be added later
  without touching call sites)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then apply the schema:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push   # runs supabase/migrations/*.sql
   ```

   Optionally seed sample businesses, products, and Basket templates:

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```

3. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and anon key:

   ```bash
   cp .env.example .env.local
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Sign up for a customer account at `/signup`. To reach the admin
   dashboard at `/admin`, set that user's `role` to `admin` in the
   `profiles` table.

## Project layout

```
docs/ARCHITECTURE.md      Product & technical design
supabase/migrations/      Database schema (Postgres/RLS)
supabase/seed.sql         Sample businesses, products, Basket templates
src/app/(app)/            Customer app (Home, Baskets, Subscriptions, Activity, Profile)
src/app/(auth)/           Login, signup, password reset
src/app/subscribe/        Subscribe wizard
src/app/admin/            Admin dashboard (role-gated)
src/lib/data/             Typed Supabase query modules
src/lib/actions/          Server actions (mutations)
src/lib/payments/         Payment provider abstraction
src/components/           UI, basket, subscription, nav, profile, activity, admin components
```
