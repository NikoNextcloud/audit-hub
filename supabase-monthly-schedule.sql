-- Изпълни веднъж в Supabase SQL Editor преди сливане на новия месечен график.
alter table public.calendar_events
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists planning_status text not null default 'unplanned',
  add column if not exists scheduling_ok boolean not null default false,
  add column if not exists payment_ok boolean not null default false,
  add column if not exists audit_ok boolean not null default false,
  add column if not exists completed boolean not null default false,
  add column if not exists completed_at timestamptz,
  add column if not exists renewal_source_id text references public.calendar_events(id) on delete set null;

alter table public.calendar_events
  drop constraint if exists calendar_events_planning_status_check;

alter table public.calendar_events
  add constraint calendar_events_planning_status_check
  check (planning_status in ('planned', 'unplanned'));

create index if not exists calendar_events_company_id_idx
  on public.calendar_events(company_id);

create index if not exists calendar_events_monthly_schedule_idx
  on public.calendar_events(event_date, completed);

-- Свързва старите записи, когато заглавието съвпада точно с името на фирмата.
update public.calendar_events ce
set company_id = c.id
from public.companies c
where ce.company_id is null
  and lower(trim(ce.title)) = lower(trim(c.name));
