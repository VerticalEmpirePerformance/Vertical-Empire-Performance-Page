alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, is_approved, full_name, birthdate, country, phone_code, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    false,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'birthdate', '')::date,
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'phone_code',
    new.raw_user_meta_data->>'phone',
    new.email
  );
  return new;
end;
$$;
