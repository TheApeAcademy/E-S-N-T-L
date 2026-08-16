-- Row Level Security for ESNTL.
-- Customers may only read/write rows they own. Admins (profiles.role =
-- 'admin') get full access. Basket templates and the marketplace catalog
-- (businesses, categories, products) are public-read.

create function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.payment_methods enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.vendor_inventory enable row level security;
alter table public.baskets enable row level security;
alter table public.basket_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_items enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_items enable row level security;
alter table public.payments enable row level security;
alter table public.activity_events enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles self read" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update
  using (id = auth.uid() or public.is_admin());
create policy "profiles admin insert" on public.profiles for insert
  with check (public.is_admin());

-- addresses
create policy "addresses owner all" on public.addresses for all
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- payment_methods
create policy "payment_methods owner all" on public.payment_methods for all
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- catalog: public read, admin write
create policy "businesses public read" on public.businesses for select using (true);
create policy "businesses admin write" on public.businesses for insert with check (public.is_admin());
create policy "businesses admin update" on public.businesses for update using (public.is_admin());
create policy "businesses admin delete" on public.businesses for delete using (public.is_admin());

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for insert with check (public.is_admin());
create policy "categories admin update" on public.categories for update using (public.is_admin());
create policy "categories admin delete" on public.categories for delete using (public.is_admin());

create policy "products public read" on public.products for select using (true);
create policy "products admin write" on public.products for insert with check (public.is_admin());
create policy "products admin update" on public.products for update using (public.is_admin());
create policy "products admin delete" on public.products for delete using (public.is_admin());

create policy "vendor_inventory public read" on public.vendor_inventory for select using (true);
create policy "vendor_inventory admin write" on public.vendor_inventory for insert with check (public.is_admin());
create policy "vendor_inventory admin update" on public.vendor_inventory for update using (public.is_admin());
create policy "vendor_inventory admin delete" on public.vendor_inventory for delete using (public.is_admin());

-- baskets: templates are public-read, custom baskets are owner-only
create policy "baskets read" on public.baskets for select
  using (kind = 'template' or owner_id = auth.uid() or public.is_admin());
create policy "baskets owner insert" on public.baskets for insert
  with check (
    (kind = 'custom' and owner_id = auth.uid())
    or (kind = 'template' and public.is_admin())
  );
create policy "baskets owner update" on public.baskets for update
  using (owner_id = auth.uid() or public.is_admin());
create policy "baskets owner delete" on public.baskets for delete
  using (owner_id = auth.uid() or public.is_admin());

-- basket_items follow the parent basket's visibility/ownership
create policy "basket_items read" on public.basket_items for select
  using (
    exists (
      select 1 from public.baskets b
      where b.id = basket_id
        and (b.kind = 'template' or b.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "basket_items write" on public.basket_items for all
  using (
    exists (
      select 1 from public.baskets b
      where b.id = basket_id and (b.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.baskets b
      where b.id = basket_id and (b.owner_id = auth.uid() or public.is_admin())
    )
  );

-- subscriptions & derivatives: owner-only
create policy "subscriptions owner all" on public.subscriptions for all
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "subscription_items owner read" on public.subscription_items for select
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and (s.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "subscription_items owner write" on public.subscription_items for insert
  with check (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "deliveries owner read" on public.deliveries for select
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and (s.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "deliveries admin write" on public.deliveries for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "delivery_items owner read" on public.delivery_items for select
  using (
    exists (
      select 1 from public.deliveries d
      join public.subscriptions s on s.id = d.subscription_id
      where d.id = delivery_id and (s.owner_id = auth.uid() or public.is_admin())
    )
  );
create policy "delivery_items admin write" on public.delivery_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- payments: owner-only read, admin write (payment status transitions are server-controlled)
create policy "payments owner read" on public.payments for select
  using (owner_id = auth.uid() or public.is_admin());
create policy "payments owner insert" on public.payments for insert
  with check (owner_id = auth.uid() or public.is_admin());
create policy "payments admin update" on public.payments for update
  using (public.is_admin());

-- activity & notifications: owner-only
create policy "activity_events owner read" on public.activity_events for select
  using (profile_id = auth.uid() or public.is_admin());
create policy "activity_events owner insert" on public.activity_events for insert
  with check (profile_id = auth.uid() or public.is_admin());

create policy "notification_preferences owner all" on public.notification_preferences for all
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "notifications owner read" on public.notifications for select
  using (profile_id = auth.uid() or public.is_admin());
create policy "notifications owner update" on public.notifications for update
  using (profile_id = auth.uid() or public.is_admin());
