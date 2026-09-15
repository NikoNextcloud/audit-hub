-- Отделна дата на сертификата и календарен цикъл за всеки стандарт.

alter table public.calendar_events
  add column if not exists certification_standard text;

update public.calendar_events as event
set certification_standard = coalesce(company.standards -> 0 ->> 'name', 'Сертификация')
from public.companies as company
where event.company_id = company.id
  and event.certification_stage is not null
  and event.certification_standard is null;

drop index if exists public.calendar_events_certification_cycle_uidx;

create unique index calendar_events_certification_cycle_uidx
  on public.calendar_events(company_id, certification_standard, certificate_issue_date, certification_stage)
  where certification_standard is not null
    and certificate_issue_date is not null
    and certification_stage is not null;
