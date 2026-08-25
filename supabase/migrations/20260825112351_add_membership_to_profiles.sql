alter table public.profiles
  add column if not exists membership text check (membership in ('basic', 'coaching', 'full'));
