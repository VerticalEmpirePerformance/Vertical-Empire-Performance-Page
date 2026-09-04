alter table public.coach_applications add column if not exists age integer;
alter table public.coach_applications add column if not exists country text;
alter table public.coach_applications add column if not exists years_experience text;
alter table public.coach_applications add column if not exists available_days text[];
alter table public.coach_applications drop column if exists experience;
