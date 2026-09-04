alter table public.profiles add column if not exists feedback_requested_at timestamptz;
alter table public.profiles add column if not exists feedback_status text default 'pending';
