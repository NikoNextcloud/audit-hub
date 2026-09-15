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
  certificate_issue_date date,
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
  calendar_event_id text,
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
  company_id uuid references companies(id) on delete cascade,
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
  planning_status text not null default 'planned' check (planning_status in ('planned', 'unplanned')),
  scheduling_ok boolean not null default false,
  payment_ok boolean not null default false,
  audit_ok boolean not null default false,
  completed boolean not null default false,
  completed_at timestamptz,
  renewal_source_id text references calendar_events(id) on delete set null,
  certificate_issue_date date,
  certification_stage text check (certification_stage is null or certification_stage in ('first_control', 'second_control', 'recertification')),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table payments
  add constraint payments_calendar_event_id_fkey
  foreign key (calendar_event_id) references calendar_events(id) on delete cascade;

create unique index payments_calendar_event_id_uidx
  on payments(calendar_event_id)
  where calendar_event_id is not null;

create unique index calendar_events_certification_cycle_uidx
  on calendar_events(company_id, certificate_issue_date, certification_stage)
  where certificate_issue_date is not null and certification_stage is not null;

create table auditor_calendar_auditors (
  id text primary key,
  name text not null unique,
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table auditor_calendar_entries (
  id text primary key,
  event_date date not null,
  company_name text not null,
  details text,
  auditor_id text not null references auditor_calendar_auditors(id) on delete restrict,
  source_sheet text,
  source_cell text,
  sort_order integer not null default 0,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source_sheet, source_cell)
);

create index auditor_calendar_entries_date_idx on auditor_calendar_entries(event_date);
create index auditor_calendar_entries_auditor_idx on auditor_calendar_entries(auditor_id);
create index auditor_calendar_auditors_created_by_idx on auditor_calendar_auditors(created_by);
create index auditor_calendar_auditors_updated_by_idx on auditor_calendar_auditors(updated_by);
create index auditor_calendar_entries_created_by_idx on auditor_calendar_entries(created_by);
create index auditor_calendar_entries_updated_by_idx on auditor_calendar_entries(updated_by);

alter table profiles enable row level security;
alter table companies enable row level security;
alter table audits enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;
alter table activity_log enable row level security;
alter table audit_tasks enable row level security;
alter table calendar_events enable row level security;
alter table auditor_calendar_auditors enable row level security;
alter table auditor_calendar_entries enable row level security;

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

create policy "authenticated users can read auditor calendar auditors" on auditor_calendar_auditors
  for select to authenticated using (true);

create policy "authenticated users can insert auditor calendar auditors" on auditor_calendar_auditors
  for insert to authenticated with check (true);
create policy "authenticated users can update auditor calendar auditors" on auditor_calendar_auditors
  for update to authenticated using (true) with check (true);
create policy "authenticated users can delete auditor calendar auditors" on auditor_calendar_auditors
  for delete to authenticated using (true);

create policy "authenticated users can read auditor calendar entries" on auditor_calendar_entries
  for select to authenticated using (true);

create policy "authenticated users can insert auditor calendar entries" on auditor_calendar_entries
  for insert to authenticated with check (true);
create policy "authenticated users can update auditor calendar entries" on auditor_calendar_entries
  for update to authenticated using (true) with check (true);
create policy "authenticated users can delete auditor calendar entries" on auditor_calendar_entries
  for delete to authenticated using (true);

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
