-- Сертификационен цикъл в основните свързани модули.
-- Табът „Календар Одити“ не използва тези полета.

alter table public.companies
  add column if not exists certificate_issue_date date;

alter table public.calendar_events
  add column if not exists certificate_issue_date date,
  add column if not exists certification_stage text;

alter table public.calendar_events
  drop constraint if exists calendar_events_certification_stage_check;

alter table public.calendar_events
  add constraint calendar_events_certification_stage_check
  check (
    certification_stage is null
    or certification_stage in ('first_control', 'second_control', 'recertification')
  );

create unique index if not exists calendar_events_certification_cycle_uidx
  on public.calendar_events(company_id, certificate_issue_date, certification_stage)
  where certificate_issue_date is not null and certification_stage is not null;
