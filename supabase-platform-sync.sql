-- Свързва Календар, Плащания и Фирми без загуба на съществуващи данни.
-- Изпълнява се еднократно в Supabase SQL Editor за проекта audit.

alter table public.payments
  add column if not exists calendar_event_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_calendar_event_id_fkey'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_calendar_event_id_fkey
      foreign key (calendar_event_id)
      references public.calendar_events(id)
      on delete cascade;
  end if;
end
$$;

create unique index if not exists payments_calendar_event_id_uidx
  on public.payments(calendar_event_id)
  where calendar_event_id is not null;

alter table public.calendar_events
  drop constraint if exists calendar_events_company_id_fkey;

alter table public.calendar_events
  add constraint calendar_events_company_id_fkey
  foreign key (company_id)
  references public.companies(id)
  on delete cascade;

insert into public.payments (
  company_id,
  calendar_event_id,
  invoice,
  amount,
  due_date,
  paid_date,
  status,
  created_by,
  updated_by,
  updated_at,
  created_at
)
select
  event.company_id,
  event.id,
  'Календар ' || event.event_date::text,
  0,
  event.event_date,
  current_date,
  'paid',
  event.created_by,
  event.updated_by,
  now(),
  now()
from public.calendar_events as event
where event.payment_ok = true
  and event.company_id is not null
  and not exists (
    select 1
    from public.payments as payment
    where payment.calendar_event_id = event.id
  );
