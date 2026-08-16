-- Harden the trigger-only functions flagged by the Supabase security
-- linter: pin search_path (defends against search_path hijacking) and
-- revoke direct RPC execution, since these are only ever meant to run as
-- triggers, never called directly by a client. `is_admin()` is
-- deliberately left publicly executable — RLS policies invoke it for
-- every role, and it only reveals the caller's own admin status, not any
-- other data.

create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
