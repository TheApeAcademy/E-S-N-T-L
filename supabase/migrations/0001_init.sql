-- ESNTL core schema
-- See docs/ARCHITECTURE.md section 4 for the design rationale.

create extension if not exists "pgcrypto";

-- =========================================================================
-- PROFILES & IDENTITY
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'home' check (label in ('home', 'school', 'office', 'other')),
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  country text not null default 'Nigeria',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_profile_id_idx on public.addresses (profile_id);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'mock',
  type text not null default 'card' check (type in ('card', 'bank_transfer', 'wallet')),
  label text not null,
  last4 text,
  token_ref text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index payment_methods_owner_id_idx on public.payment_methods (owner_id);

-- =========================================================================
-- MARKETPLACE: BUSINESSES, CATEGORIES, PRODUCTS
-- =========================================================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  parent_id uuid references public.categories (id) on delete set null
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text,
  images text[] not null default '{}',
  unit text not null default 'unit',
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'NGN',
  stock_qty integer not null default 0,
  is_subscription_eligible boolean not null default true,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_business_id_idx on public.products (business_id);
create index products_category_id_idx on public.products (category_id);

create table public.vendor_inventory (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  stock_qty integer not null default 0,
  is_available boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (business_id, product_id)
);

-- =========================================================================
-- BASKETS
-- =========================================================================

create table public.baskets (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'custom' check (kind in ('template', 'custom')),
  owner_id uuid references public.profiles (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'saved', 'subscribed', 'archived')),
  name text not null,
  description text,
  image_url text,
  category_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint template_has_no_owner check (
    (kind = 'template' and owner_id is null) or (kind = 'custom')
  )
);

create index baskets_owner_id_idx on public.baskets (owner_id);
create index baskets_kind_idx on public.baskets (kind);

create table public.basket_items (
  id uuid primary key default gen_random_uuid(),
  basket_id uuid not null references public.baskets (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (basket_id, product_id)
);

create index basket_items_basket_id_idx on public.basket_items (basket_id);

-- =========================================================================
-- SUBSCRIPTIONS & DELIVERIES
-- =========================================================================

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  basket_id uuid not null references public.baskets (id) on delete restrict,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  frequency text not null check (
    frequency in ('weekly', 'biweekly', 'monthly', 'bimonthly', 'semester', 'custom')
  ),
  custom_interval_days integer,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  next_delivery_at date not null,
  address_id uuid not null references public.addresses (id) on delete restrict,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  delivery_fee numeric(12, 2) not null default 0,
  item_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paused_at timestamptz,
  cancelled_at timestamptz
);

create index subscriptions_owner_id_idx on public.subscriptions (owner_id);
create index subscriptions_basket_id_idx on public.subscriptions (basket_id);

-- Snapshot of basket contents at the time of subscribing / last "Edit Basket".
-- `version` lets a subscription's item history be reconstructed without
-- being corrupted by later basket edits (spec section 27 requirement).
create table public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create index subscription_items_subscription_id_idx on public.subscription_items (subscription_id);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  status text not null default 'pending' check (
    status in (
      'pending', 'processing', 'vendor_confirmed', 'out_for_delivery', 'delivered', 'failed', 'skipped'
    )
  ),
  scheduled_at date not null,
  delivered_at timestamptz,
  subtotal numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deliveries_subscription_id_idx on public.deliveries (subscription_id);
create index deliveries_status_idx on public.deliveries (status);

-- Snapshot of what was actually fulfilled for a delivery (may differ from
-- subscription_items after a per-cycle edit or substitution).
create table public.delivery_items (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null
);

create index delivery_items_delivery_id_idx on public.delivery_items (delivery_id);

-- =========================================================================
-- PAYMENTS
-- =========================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  delivery_id uuid references public.deliveries (id) on delete set null,
  basket_id uuid references public.baskets (id) on delete set null,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  amount numeric(12, 2) not null,
  currency text not null default 'NGN',
  status text not null default 'pending' check (
    status in ('pending', 'successful', 'failed', 'refunded')
  ),
  provider text not null default 'mock',
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_owner_id_idx on public.payments (owner_id);
create index payments_delivery_id_idx on public.payments (delivery_id);

-- =========================================================================
-- ACTIVITY & NOTIFICATIONS
-- =========================================================================

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create index activity_events_profile_id_idx on public.activity_events (profile_id, occurred_at desc);

create table public.notification_preferences (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  subscription_reminders boolean not null default true,
  payment_notifications boolean not null default true,
  delivery_updates boolean not null default true,
  promotions boolean not null default false
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_idx on public.notifications (profile_id, created_at desc);

-- =========================================================================
-- updated_at triggers
-- =========================================================================

create function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.baskets
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.deliveries
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'customer');
  insert into public.notification_preferences (profile_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
