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
