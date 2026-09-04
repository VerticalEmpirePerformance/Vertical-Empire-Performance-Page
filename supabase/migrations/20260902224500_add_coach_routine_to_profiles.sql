alter table public.profiles add column if not exists coach_routine text;

create policy "Coaches can update profiles"
on public.profiles
for update
to authenticated
using (public.is_coach())
with check (public.is_coach());
