drop policy if exists "Coaches can view all profiles" on public.profiles;

create or replace function public.is_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'coach'
  );
$$;

create policy "Coaches can view all profiles"
on public.profiles
for select
to authenticated
using (public.is_coach());
