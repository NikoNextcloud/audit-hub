alter table public.calendar_events
  add column if not exists category text,
  add column if not exists color text;

update public.calendar_events
set color = case
  when calendar_type = 'auditors'
    and lower(coalesce(auditor, '')) like '%георги георгиев%' then 'green'
  when calendar_type = 'auditors'
    and lower(coalesce(auditor, '')) like '%екатерина георгиева%' then 'red'
  when calendar_type = 'planned' and category = 'certification' then 'blue'
  when calendar_type = 'planned' and category = 'consulting' then 'green'
  when calendar_type = 'planned' and category = 'occupational_medicine' then 'red'
  when calendar_type = 'planned' then coalesce(color, 'yellow')
  else coalesce(color, 'neutral')
end
where color is null or btrim(color) = '';
