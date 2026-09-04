create table public.coach_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  experience text not null,
  created_at timestamptz not null default now()
);

alter table public.coach_applications enable row level security;

create policy "Anyone can submit a coach application"
on public.coach_applications
for insert
to anon, authenticated
with check (true);

create policy "Coaches can view coach applications"
on public.coach_applications
for select
to authenticated
using (public.is_coach());
