-- TruckingCostr AU production schema
-- Applied to Supabase project yxbuafwhfyxyrfvzbzpb (ap-southeast-2).
-- All user-owned records are protected by RLS. Never put service-role keys in the browser.

create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_workspaces_workspace_object check (jsonb_typeof(workspace) = 'object')
);

create table if not exists public.driver_jokes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 240),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','published','rejected','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.weighbridge_reports (
  id uuid primary key default gen_random_uuid(),
  site_id text not null check (char_length(trim(site_id)) between 1 and 100),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('operating','closed','not_operating')),
  note text not null default '' check (char_length(note) <= 160),
  created_at timestamptz not null default now()
);

create index if not exists driver_jokes_published_created_idx
  on public.driver_jokes (created_at desc)
  where moderation_status = 'published';
create index if not exists driver_jokes_author_id_idx
  on public.driver_jokes (author_id);
create index if not exists weighbridge_reports_site_created_idx
  on public.weighbridge_reports (site_id, created_at desc);
create index if not exists weighbridge_reports_reporter_id_idx
  on public.weighbridge_reports (reporter_id);

alter table public.user_workspaces enable row level security;
alter table public.driver_jokes enable row level security;
alter table public.weighbridge_reports enable row level security;

revoke all on public.user_workspaces from anon, authenticated;
revoke all on public.driver_jokes from anon, authenticated;
revoke all on public.weighbridge_reports from anon, authenticated;

grant select, insert, update, delete on public.user_workspaces to authenticated;
grant select on public.driver_jokes to anon, authenticated;
grant insert, delete on public.driver_jokes to authenticated;
grant select on public.weighbridge_reports to anon, authenticated;
grant insert, delete on public.weighbridge_reports to authenticated;

create policy "Users manage their own workspace"
  on public.user_workspaces for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Anyone can read published jokes"
  on public.driver_jokes for select to anon, authenticated
  using (moderation_status = 'published' or author_id = (select auth.uid()));

create policy "Authenticated users submit pending jokes"
  on public.driver_jokes for insert to authenticated
  with check ((select auth.uid()) = author_id and moderation_status = 'pending');

create policy "Authors can delete their own jokes"
  on public.driver_jokes for delete to authenticated
  using ((select auth.uid()) = author_id);

create policy "Anyone can read weighbridge reports"
  on public.weighbridge_reports for select to anon, authenticated
  using (true);

create policy "Authenticated users submit their own reports"
  on public.weighbridge_reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

create policy "Authors can delete their own weighbridge reports"
  on public.weighbridge_reports for delete to authenticated
  using ((select auth.uid()) = reporter_id);
