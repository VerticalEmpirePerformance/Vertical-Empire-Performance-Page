create policy "Coaches can view all profiles"
on public.profiles
for select
to authenticated
using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'coach');
