insert into profiles (id, full_name, role)
select
  id,
  case email
    when 'georgi@audit.local' then 'Георги'
    when 'nikol@audit.local' then 'Никол'
    when 'admin@audit.local' then 'Админ'
    when 'katya@audit.local' then 'Катя'
    else coalesce(raw_user_meta_data->>'full_name', email)
  end as full_name,
  case email
    when 'admin@audit.local' then 'admin'
    when 'katya@audit.local' then 'accounting'
    else 'auditor'
  end as role
from auth.users
where email in (
  'georgi@audit.local',
  'nikol@audit.local',
  'admin@audit.local',
  'katya@audit.local'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role;

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

drop policy if exists "authenticated users can write companies" on companies;
drop policy if exists "authenticated users can write audits" on audits;
drop policy if exists "authenticated users can write payments" on payments;
drop policy if exists "authenticated users can write documents" on documents;
drop policy if exists "authenticated users can write audit tasks" on audit_tasks;
drop policy if exists "authenticated users can write calendar events" on calendar_events;

drop policy if exists "authenticated users can insert companies" on companies;
drop policy if exists "authenticated users can update companies" on companies;
drop policy if exists "admin users can delete companies" on companies;

drop policy if exists "authenticated users can insert audits" on audits;
drop policy if exists "authenticated users can update audits" on audits;
drop policy if exists "admin users can delete audits" on audits;

drop policy if exists "authenticated users can insert payments" on payments;
drop policy if exists "authenticated users can update payments" on payments;
drop policy if exists "admin users can delete payments" on payments;

drop policy if exists "authenticated users can insert documents" on documents;
drop policy if exists "authenticated users can update documents" on documents;
drop policy if exists "admin users can delete documents" on documents;

drop policy if exists "authenticated users can insert audit tasks" on audit_tasks;
drop policy if exists "authenticated users can update audit tasks" on audit_tasks;
drop policy if exists "authenticated users can delete audit tasks" on audit_tasks;
drop policy if exists "authenticated users can insert calendar events" on calendar_events;
drop policy if exists "authenticated users can update calendar events" on calendar_events;
drop policy if exists "admin users can delete calendar events" on calendar_events;

create policy "authenticated users can insert companies" on companies
  for insert to authenticated with check (true);
create policy "authenticated users can update companies" on companies
  for update to authenticated using (true) with check (true);
create policy "admin users can delete companies" on companies
  for delete to authenticated using (public.is_admin());

create policy "authenticated users can insert audits" on audits
  for insert to authenticated with check (true);
create policy "authenticated users can update audits" on audits
  for update to authenticated using (true) with check (true);
create policy "admin users can delete audits" on audits
  for delete to authenticated using (public.is_admin());

create policy "authenticated users can insert payments" on payments
  for insert to authenticated with check (true);
create policy "authenticated users can update payments" on payments
  for update to authenticated using (true) with check (true);
create policy "admin users can delete payments" on payments
  for delete to authenticated using (public.is_admin());

create policy "authenticated users can insert documents" on documents
  for insert to authenticated with check (true);
create policy "authenticated users can update documents" on documents
  for update to authenticated using (true) with check (true);
create policy "admin users can delete documents" on documents
  for delete to authenticated using (public.is_admin());

create policy "authenticated users can insert audit tasks" on audit_tasks
  for insert to authenticated with check (true);
create policy "authenticated users can update audit tasks" on audit_tasks
  for update to authenticated using (true) with check (true);
create policy "authenticated users can delete audit tasks" on audit_tasks
  for delete to authenticated using (true);

create policy "authenticated users can insert calendar events" on calendar_events
  for insert to authenticated with check (true);
create policy "authenticated users can update calendar events" on calendar_events
  for update to authenticated using (true) with check (true);
create policy "admin users can delete calendar events" on calendar_events
  for delete to authenticated using (public.is_admin());

drop policy if exists "authenticated users can insert profiles" on profiles;
drop policy if exists "authenticated users can update own profile" on profiles;

create policy "authenticated users can insert profiles" on profiles
  for insert to authenticated with check (id = (select auth.uid()));

create policy "authenticated users can update own profile" on profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());
