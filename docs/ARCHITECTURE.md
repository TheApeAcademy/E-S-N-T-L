# ESNTL — Product & Technical Architecture

**Everything in one Basket.**

This document is the analysis and design pass required by the ESNTL Master
Product & Development Specification before implementation. It defines the
MVP scope, information architecture, database schema, core flows, admin
architecture, technology stack, and UI component system.

---

## 1. Analysis of the specification

### 1.1 Contradictions / ambiguities found

1. **"Add to Basket" vs targeted basket.** The spec doesn't say which basket
   a product lands in when there are multiple Saved Baskets. Resolution:
   `Add to Basket` opens a lightweight chooser ("Add to which basket?") with
   the most-recently-edited basket pre-selected and a `+ New Basket` option.
2. **One vendor per Basket vs multi-vendor Baskets.** Section 19 says the
   architecture should *eventually* support multi-vendor fulfillment per
   Basket, but section 19 also explicitly permits simplifying for MVP. The
   schema is built multi-vendor-ready from day one (every `basket_item`
   references a specific `product`, which belongs to one `business`), but
   the MVP delivery model coordinates a **single delivery per basket per
   cycle** that may internally contain items from multiple vendors — the
   complexity is absorbed by the `delivery_items` join, not hidden from the
   schema.
3. **Basket price vs product price.** Product prices are vendor-owned and
   can change. A `Basket` (template/saved) has no stored price — it's
   computed live from current item prices. A `Subscription`, once created,
   **snapshots** item prices at each billing cycle into
   `subscription_items`/`deliveries` so history never drifts (spec §27
   explicitly requires this).
4. **"Save Basket" vs "Basket Template".** These are different concepts
   that share a shape: a *Basket Template* is an ESNTL-curated basket
   (admin-owned, public); a *Saved Basket* is a customer-owned draft. Both
   are represented by the same `baskets` table distinguished by `kind`
   (`template` | `custom`) and `owner_id` (null for templates).
5. **Roles.** Spec asks for `customer`/`admin` now, with `vendor`,
   `operations`, `delivery_partner` reserved for later. Modeled as a
   `role` enum on `profiles` plus a separate `business_members` join table
   for the future vendor role, so adding roles later needs no migration of
   existing data.

### 1.2 Improvements adopted

- **Idempotent recurring billing**: subscriptions drive delivery generation
  via a `next_run_at` timestamp + status machine, not client-side date
  math, so pause/skip/resume can't create duplicate deliveries.
- **Activity log as an event table**, not derived — every state transition
  (subscribe, payment, fulfillment step, delivery) writes an
  `activity_events` row, giving the transparent timeline the spec asks for
  "for free" from every other feature.
- **Payment abstraction** (`lib/payments`) — a `PaymentProvider` interface
  with a `MockPaymentProvider` implementation today, so a Nigerian provider
  (Paystack/Flutterwave) can be dropped in later behind the same interface
  without touching call sites.

---

## 2. MVP scope

MVP proves exactly the loop in spec §25:
**Discover → Build Basket → Save → Subscribe → Pay → Fulfill → Deliver → Repeat.**

In scope:
- Email/password auth, customer + admin roles.
- Home command center, product/basket search.
- Basket Builder, Basket Templates ("Customize this Basket"), Saved Baskets.
- Subscribe wizard (frequency, date, address, payment method, review).
- Subscription management (edit, skip, pause, resume, cancel).
- Deliveries (generated per subscription cycle, status tracked).
- Profile (baskets, subscriptions, deliveries, payments, addresses,
  payment methods, notifications preferences).
- Activity timeline.
- Admin dashboard: overview, customers, businesses, products, basket
  templates, subscriptions, payments, deliveries.
- Mock payment provider behind a real abstraction.

Explicitly deferred (architecture allows, MVP doesn't build):
- Smart Baskets (consumption-based quantity suggestions) — schema captures
  raw data (`delivery_items` actuals) needed to build this later.
- Vendor self-service portal (business role exists, no vendor UI yet).
- Real payment provider integration, SMS/phone auth, 2FA.
- Cross-vendor delivery routing/logistics optimization.

---

## 3. Information architecture

Customer app (mobile-first, bottom nav): **Home · Baskets · Subscriptions ·
Activity · Profile**, plus a persistent **+ Build Basket** action.

```
/                        Home
/search                  Product & basket search
/baskets                 Active / Saved / Past + Templates
/baskets/new              Basket Builder (new)
/baskets/[id]             Basket detail / edit (builder)
/baskets/templates/[id]   Template detail → "Customize this Basket"
/subscribe/[basketId]     Subscribe wizard
/subscriptions            List
/subscriptions/[id]       Manage (edit, skip, pause, cancel, deliveries)
/activity                 Timeline
/profile                  Overview
/profile/addresses
/profile/payment-methods
/profile/notifications
/profile/security
/login /signup /reset-password

/admin                    Overview (role=admin only)
/admin/customers[/:id]
/admin/businesses[/:id]
/admin/products[/:id]
/admin/baskets            Templates
/admin/subscriptions
/admin/payments
/admin/deliveries
```

---

## 4. Database schema (Postgres / Supabase)

See `supabase/migrations/0001_init.sql` for the full DDL. Entity summary:

- **profiles** (1:1 with `auth.users`) — role (`customer`|`admin`), name, phone.
- **addresses** — belongs to profile, labeled (Home/School/Office/Other).
- **businesses** — vendor/partner record.
- **categories** — product taxonomy.
- **products** — belongs to a business + category; price, stock, subscription eligibility.
- **baskets** — `kind` (`template`|`custom`), `status`
  (`draft`|`saved`|`subscribed`|`archived`), owner (null for templates),
  category, name, image.
- **basket_items** — basket ↔ product with quantity (source of truth for
  both templates and saved baskets; price is *not* stored here, it's read
  live from `products`).
- **subscriptions** — references the originating `basket`, frequency,
  status (`active`|`paused`|`cancelled`), next delivery date, address,
  payment method.
- **subscription_items** — **snapshot** of basket_items at subscribe time
  (product, quantity, unit price) so later basket edits don't rewrite
  history; kept in sync going forward by explicit "Edit Basket" actions on
  the subscription, each producing a new snapshot version.
- **deliveries** — one per fulfillment cycle of a subscription; status
  pipeline (`pending`→`processing`→`vendor_confirmed`→`out_for_delivery`→
  `delivered`|`failed`), amount, delivery fee.
- **delivery_items** — snapshot of what was actually fulfilled (may differ
  from subscription_items after a skip/substitution).
- **payment_methods** — tokenized reference only (no PAN/card data stored).
- **payments** — one per delivery (or ad-hoc basket purchase), status,
  provider reference, amount.
- **activity_events** — append-only timeline, `actor`, `type`, `payload`, `occurred_at`.
- **notifications** — user-facing notification records + preferences.
- **vendor_inventory** — stock/availability per business per product (kept
  separate from `products.stock` to support the same product being
  restocked independently across a business's own systems later).

RLS: customers can only `select`/`update` rows where `owner_id = auth.uid()`
(or via join to their own profile); all admin tables are gated by
`profiles.role = 'admin'`. Basket *templates* are publicly readable.

---

## 5. Core user flows

1. **Browse → Build**: Home/Search → product → *Add to Basket* → basket
   chooser → Basket Builder shows live summary → *Save Basket*.
2. **Template → Customize**: Discover Baskets → template detail →
   *Customize this Basket* → clones template into a `custom` basket owned
   by the user → Builder.
3. **Subscribe**: Basket detail → *Subscribe to Basket* → wizard
   (frequency → date → address → payment method → review) → confirm →
   basket.status = `subscribed`, subscription created, first delivery
   scheduled, activity events written, confirmation screen.
4. **Manage subscription**: skip (advances `next_delivery_at` without
   charging), pause (status=`paused`, no deliveries generated), resume,
   cancel (status=`cancelled`, future deliveries removed), edit basket
   (opens builder scoped to the subscription, next cycle uses new snapshot).
5. **Delivery lifecycle**: a scheduled job (represented in MVP by an admin
   action / server route, not a real cron worker) advances due
   subscriptions → creates `delivery` + `delivery_items` + `payment` →
   on payment success, activity events fire through the fulfillment
   pipeline.

---

## 6. Admin architecture

Separate route group `/admin`, gated by middleware checking
`profiles.role = 'admin'` server-side (never trust client state). Read/write
access to all entities; customers table is read + support actions only
(no destructive edits to a customer's payment data). Business management
covers products/pricing/inventory per business. Basket template CRUD lives
here (`baskets` rows with `kind = 'template'`).

---

## 7. Technology architecture

- **Next.js 16 (App Router) + TypeScript + Tailwind v4** — one deployable
  app serving both the customer PWA-style mobile-first UI and the admin
  dashboard, avoiding a second service for MVP.
- **Supabase** (Postgres + Auth + RLS) as the backend. `@supabase/ssr` for
  server components/middleware, `@supabase/supabase-js` client.
- **lib/payments** — provider-agnostic interface; `MockPaymentProvider` for
  MVP; real provider adapters implement the same interface later.
- No ORM; typed SQL access via generated Supabase types
  (`lib/database.types.ts`) plus thin query modules in `lib/data/*`, kept
  intentionally simple over introducing Prisma for a schema this size.

---

## 8. UI component system

Brand: **Orange `#FF6A00` + Black `#0A0A0A` + White**, neutral grays for
interface chrome; orange reserved for primary actions/active states, never
used as a full-bleed background. Base components in `src/components/ui`:
`Button`, `Card`, `Badge`, `Input`, `Select`, `Chip`, `ProgressSteps`. Domain
components in `src/components/basket`, `.../subscription`, `.../nav`:
`BasketCard`, `ActiveBasketCard`, `ProductCard`, `BottomNav`,
`BuildBasketFab`, `TopBar`, `BasketSummaryBar`, `ActivityItem`,
`DeliveryTimeline`.
