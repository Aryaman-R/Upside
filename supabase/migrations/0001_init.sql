-- Upside backend — Phase 1: auth + offline-first state sync.
--
-- Strategy: each authenticated user gets a single JSONB snapshot of their app
-- state (the same shape the React reducer already produces). This makes the
-- existing client multi-device with minimal change and keeps it offline-first.
-- Normalised tables (positions, journal, social, …) come in Phase 2, when we
-- need server-authoritative money + real multiplayer queries (see docs/BACKEND.md).
--
-- Security: Row-Level Security isolates every row to its owner (auth.uid()).
-- The journal/mood data this stores is sensitive, so RLS is mandatory.

create table if not exists public.app_state (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  state          jsonb not null default '{}'::jsonb,
  schema_version integer not null default 0,
  updated_at     timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- A user may only read/write their own snapshot.
drop policy if exists "app_state_select_own" on public.app_state;
create policy "app_state_select_own" on public.app_state
  for select using (auth.uid() = user_id);

drop policy if exists "app_state_insert_own" on public.app_state;
create policy "app_state_insert_own" on public.app_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "app_state_update_own" on public.app_state;
create policy "app_state_update_own" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "app_state_delete_own" on public.app_state;
create policy "app_state_delete_own" on public.app_state
  for delete using (auth.uid() = user_id);

-- Keep updated_at fresh on every write (used for last-write-wins sync).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_state_touch on public.app_state;
create trigger app_state_touch
  before update on public.app_state
  for each row execute function public.touch_updated_at();
