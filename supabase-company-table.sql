-- Изпълни веднъж в Supabase SQL Editor преди публикуване на новия интерфейс „Фирми“.
alter table public.companies
  add column if not exists activities text[] not null default '{}',
  add column if not exists standards jsonb not null default '[]'::jsonb;

update public.companies
set status = 'inactive'
where status in ('watch', 'archived');

alter table public.companies
  drop constraint if exists companies_status_check;

alter table public.companies
  add constraint companies_status_check check (status in ('active', 'inactive'));
