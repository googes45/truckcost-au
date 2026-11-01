-- TruckingCostr AU — owner-only lifetime free access management
-- Run these statements in Supabase Dashboard > SQL Editor for project yxbuafwhfyxyrfvzbzpb.
-- Do NOT put this file, or admin SQL, into the public app or share it with invited users.
--
-- 1) Grant lifetime free access to one person by email.
-- Works whether they have signed up already or will sign up later.
insert into public.lifetime_access_grants (email, user_id, reason, granted_by)
values (
  lower(trim('person@example.com')),
  (select id from auth.users where lower(email) = lower(trim('person@example.com')) limit 1),
  'Lifetime complimentary access',
  'owner'
)
on conflict (email) do update
set user_id = coalesce(public.lifetime_access_grants.user_id, excluded.user_id),
    reason = excluded.reason,
    revoked_at = null,
    revoked_by = null;

-- 2) Check who has an active lifetime grant.
select email, user_id, reason, granted_at
from public.lifetime_access_grants
where revoked_at is null
order by granted_at desc;

-- 3) Revoke a grant if needed (replace the email).
update public.lifetime_access_grants
set revoked_at = now(), revoked_by = 'owner'
where email = lower(trim('person@example.com'))
  and revoked_at is null;

-- The recipient's access link is the normal app URL:
-- https://googes45.github.io/truckcost-au/
-- They create an account using the exact email address granted above.
-- If they sign up later, a private auth trigger automatically attaches the grant.
