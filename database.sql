create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bulstat text,
  contact text,
  phone text,
  email text,
  activities text[] not null default '{}',
  standards jsonb not null default '[]'::jsonb,
  mega_url text,
  status text not null default 'active',
  notes text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table audits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  audit_date date not null,
  audit_time time,
  audit_type text not null,
  auditor text,
  status text not null default 'upcoming',
  priority text not null default 'normal',
  checklist jsonb not null default '[]'::jsonb,
  reminder_days integer not null default 7,
  reminder_sent boolean not null default false,
  notes text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  invoice text,
  amount numeric(12, 2) not null default 0,
  due_date date not null,
  paid_date date,
  status text not null default 'pending',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  kind text,
  source text not null default 'Mega',
  mega_url text,
  upload_status text not null default 'local',
  storage_path text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  actor_name text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  created_at timestamptz not null default now()
);

create table audit_tasks (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  title text not null,
  assignee_id uuid references profiles(id),
  assignee_name text,
  due_date date,
  status text not null default 'pending',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table calendar_events (
  id text primary key,
  calendar_type text not null check (calendar_type in ('planned', 'auditors')),
  event_date date not null,
  event_time time,
  title text not null,
  auditor text,
  category text,
  color text,
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

alter table profiles enable row level security;
alter table companies enable row level security;
alter table audits enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;
alter table activity_log enable row level security;
alter table audit_tasks enable row level security;
alter table calendar_events enable row level security;

create policy "authenticated users can read profiles" on profiles
  for select to authenticated using (true);

create policy "authenticated users can read companies" on companies
  for select to authenticated using (true);

create policy "authenticated users can write companies" on companies
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read audits" on audits
  for select to authenticated using (true);

create policy "authenticated users can write audits" on audits
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read payments" on payments
  for select to authenticated using (true);

create policy "authenticated users can write payments" on payments
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read documents" on documents
  for select to authenticated using (true);

create policy "authenticated users can write documents" on documents
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read activity log" on activity_log
  for select to authenticated using (true);

create policy "authenticated users can insert activity log" on activity_log
  for insert to authenticated with check (true);

create policy "authenticated users can read audit tasks" on audit_tasks
  for select to authenticated using (true);

create policy "authenticated users can write audit tasks" on audit_tasks
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read calendar events" on calendar_events
  for select to authenticated using (true);

create policy "authenticated users can write calendar events" on calendar_events
  for all to authenticated using (true) with check (true);

create index companies_mega_url_idx on companies using gin (to_tsvector('simple', coalesce(mega_url, '')));
create index documents_search_idx on documents using gin (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(kind, '') || ' ' || coalesce(mega_url, ''))
);
create index calendar_events_search_idx on calendar_events using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(auditor, '') || ' ' || coalesce(notes, ''))
);
create index calendar_events_type_date_idx on calendar_events (calendar_type, event_date);

create or replace function public.get_supabase_usage()
returns table (
  database_bytes bigint,
  file_storage_bytes bigint,
  measured_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    pg_database_size(current_database())::bigint as database_bytes,
    coalesce(
      (
        select sum(
          case
            when metadata ->> 'size' ~ '^[0-9]+$'
              then (metadata ->> 'size')::bigint
            else 0
          end
        )
        from storage.objects
      ),
      0
    )::bigint as file_storage_bytes,
    now() as measured_at;
$$;

revoke all on function public.get_supabase_usage() from public;
revoke all on function public.get_supabase_usage() from anon;
grant execute on function public.get_supabase_usage() to authenticated;
