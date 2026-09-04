alter table public.profiles add column if not exists call_date date;
alter table public.profiles add column if not exists call_time text;
alter table public.profiles add column if not exists call_status text default 'pending';
