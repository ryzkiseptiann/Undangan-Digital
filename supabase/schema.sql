-- Undangan Digital Premium - Supabase schema
-- Run this file in Supabase SQL Editor for the first database setup.

create extension if not exists "pgcrypto";

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  event_type text not null default 'wedding',
  title text not null,
  bride_name text,
  groom_name text,
  display_names text not null,
  opening_text text,
  quote text,
  main_event_at timestamptz not null,
  hero_image_url text,
  music_url text,
  theme jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  address text,
  maps_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_sessions_time_order check (ends_at is null or ends_at >= starts_at)
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null,
  slug text,
  phone text,
  group_name text,
  max_pax integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_max_pax_positive check (max_pax >= 1),
  constraint guests_slug_format check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint guests_invitation_slug_unique unique (invitation_id, slug)
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  name text not null,
  attendance_status text not null,
  pax integer not null default 1,
  note text,
  created_at timestamptz not null default now(),
  constraint rsvps_name_length check (char_length(trim(name)) between 2 and 100),
  constraint rsvps_attendance_status check (
    attendance_status in ('attending', 'not_attending')
  ),
  constraint rsvps_pax_positive check (pax >= 1),
  constraint rsvps_note_length check (note is null or char_length(note) <= 300)
);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  name text not null,
  message text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  constraint wishes_name_length check (char_length(trim(name)) between 2 and 100),
  constraint wishes_message_length check (char_length(trim(message)) between 5 and 500)
);

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_accounts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  provider text not null,
  account_number text not null,
  account_name text not null,
  qr_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
before update on public.invitations
for each row
execute function public.set_updated_at();

drop trigger if exists event_sessions_set_updated_at on public.event_sessions;
create trigger event_sessions_set_updated_at
before update on public.event_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at
before update on public.guests
for each row
execute function public.set_updated_at();

drop trigger if exists galleries_set_updated_at on public.galleries;
create trigger galleries_set_updated_at
before update on public.galleries
for each row
execute function public.set_updated_at();

drop trigger if exists gift_accounts_set_updated_at on public.gift_accounts;
create trigger gift_accounts_set_updated_at
before update on public.gift_accounts
for each row
execute function public.set_updated_at();

create index if not exists invitations_slug_idx on public.invitations(slug);
create index if not exists invitations_published_idx on public.invitations(is_published);
create index if not exists event_sessions_invitation_sort_idx on public.event_sessions(invitation_id, sort_order);
create index if not exists guests_invitation_slug_idx on public.guests(invitation_id, slug);
create index if not exists rsvps_invitation_created_idx on public.rsvps(invitation_id, created_at desc);
create index if not exists wishes_invitation_created_idx on public.wishes(invitation_id, created_at desc);
create index if not exists galleries_invitation_sort_idx on public.galleries(invitation_id, sort_order);
create index if not exists gift_accounts_invitation_sort_idx on public.gift_accounts(invitation_id, sort_order);

alter table public.invitations enable row level security;
alter table public.event_sessions enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.galleries enable row level security;
alter table public.gift_accounts enable row level security;

drop policy if exists "Published invitations are publicly readable" on public.invitations;
create policy "Published invitations are publicly readable"
on public.invitations
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Published event sessions are publicly readable" on public.event_sessions;
create policy "Published event sessions are publicly readable"
on public.event_sessions
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = event_sessions.invitation_id
      and invitations.is_published = true
  )
);

drop policy if exists "Published guests are publicly readable by invitation" on public.guests;
-- No public guests select policy for MVP. Guest lists should stay private.

drop policy if exists "RSVP can be submitted to published invitations" on public.rsvps;
create policy "RSVP can be submitted to published invitations"
on public.rsvps
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = rsvps.invitation_id
      and invitations.is_published = true
  )
  and (
    rsvps.guest_id is null
    or exists (
      select 1
      from public.guests
      where guests.id = rsvps.guest_id
        and guests.invitation_id = rsvps.invitation_id
    )
  )
);

drop policy if exists "Approved wishes are publicly readable" on public.wishes;
create policy "Approved wishes are publicly readable"
on public.wishes
for select
to anon, authenticated
using (
  is_approved = true
  and exists (
    select 1
    from public.invitations
    where invitations.id = wishes.invitation_id
      and invitations.is_published = true
  )
);

drop policy if exists "Wishes can be submitted to published invitations" on public.wishes;
create policy "Wishes can be submitted to published invitations"
on public.wishes
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = wishes.invitation_id
      and invitations.is_published = true
  )
  and (
    wishes.guest_id is null
    or exists (
      select 1
      from public.guests
      where guests.id = wishes.guest_id
        and guests.invitation_id = wishes.invitation_id
    )
  )
);

drop policy if exists "Published galleries are publicly readable" on public.galleries;
create policy "Published galleries are publicly readable"
on public.galleries
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = galleries.invitation_id
      and invitations.is_published = true
  )
);

drop policy if exists "Published gift accounts are publicly readable" on public.gift_accounts;
create policy "Published gift accounts are publicly readable"
on public.gift_accounts
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = gift_accounts.invitation_id
      and invitations.is_published = true
  )
);
