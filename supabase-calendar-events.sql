create table if not exists calendar_events (
  id text primary key,
  calendar_type text not null check (calendar_type in ('planned', 'auditors')),
  event_date date not null,
  event_time time,
  title text not null,
  auditor text,
  status text not null default 'upcoming',
  priority text not null default 'normal',
  source_sheet text,
  source_cell text,
  notes text,
  checklist jsonb not null default '[]'::jsonb,
  reminder_days integer not null default 7,
  reminder_sent boolean not null default false,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

drop policy if exists "authenticated users can read calendar events" on calendar_events;
drop policy if exists "authenticated users can write calendar events" on calendar_events;
drop policy if exists "authenticated users can insert calendar events" on calendar_events;
drop policy if exists "authenticated users can update calendar events" on calendar_events;
drop policy if exists "admin users can delete calendar events" on calendar_events;

create policy "authenticated users can read calendar events" on calendar_events
  for select to authenticated using (true);

create policy "authenticated users can insert calendar events" on calendar_events
  for insert to authenticated with check (true);

create policy "authenticated users can update calendar events" on calendar_events
  for update to authenticated using (true) with check (true);

create policy "admin users can delete calendar events" on calendar_events
  for delete to authenticated using (public.is_admin());

create index if not exists calendar_events_search_idx on calendar_events using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(auditor, '') || ' ' || coalesce(notes, ''))
);

create index if not exists calendar_events_type_date_idx on calendar_events (calendar_type, event_date);
