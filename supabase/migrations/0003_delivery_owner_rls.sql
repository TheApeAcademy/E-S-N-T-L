-- The MVP subscribe/skip/cancel flows write deliveries and delivery_items
-- under the customer's own session (there is no service-role client in
-- this codebase yet — see docs/ARCHITECTURE.md section 5 "Delivery
-- lifecycle"). The original policies only granted admins write access to
-- these tables, which would block Subscribe, Skip Next Delivery, and
-- Cancel Subscription for ordinary customers. Add owner-scoped policies
-- alongside the existing admin ones (RLS policies are additive/OR'd).

create policy "deliveries owner insert" on public.deliveries for insert
  with check (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.owner_id = auth.uid()
    )
  );

create policy "deliveries owner update" on public.deliveries for update
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.owner_id = auth.uid()
    )
  );

create policy "deliveries owner delete" on public.deliveries for delete
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.owner_id = auth.uid()
    )
  );

create policy "delivery_items owner insert" on public.delivery_items for insert
  with check (
    exists (
      select 1 from public.deliveries d
      join public.subscriptions s on s.id = d.subscription_id
      where d.id = delivery_id and s.owner_id = auth.uid()
    )
  );
