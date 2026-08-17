-- Skip email confirmation entirely: every new signup is auto-confirmed at
-- insert time, so customers can sign up and log in immediately with no
-- verification link. Also defensively coalesces the token columns GoTrue
-- expects to be empty strings (never NULL) — a NULL there crashes GoTrue's
-- row scan on any subsequent read of that user (confirmed the hard way).

create function public.auto_confirm_new_user() returns trigger as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  new.confirmation_token = coalesce(new.confirmation_token, '');
  new.recovery_token = coalesce(new.recovery_token, '');
  new.email_change_token_new = coalesce(new.email_change_token_new, '');
  new.email_change = coalesce(new.email_change, '');
  new.phone_change_token = coalesce(new.phone_change_token, '');
  new.email_change_token_current = coalesce(new.email_change_token_current, '');
  new.reauthentication_token = coalesce(new.reauthentication_token, '');
  return new;
end;
$$ language plpgsql security definer set search_path = auth, public;

revoke execute on function public.auto_confirm_new_user() from public, anon, authenticated;

create trigger auto_confirm_new_user_on_signup
  before insert on auth.users
  for each row execute function public.auto_confirm_new_user();
