-- ============================================================
-- Vertical Empire Performance — Setup de perfiles (usuarios y coaches)
-- Ejecutar completo en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Tabla de perfiles (una fila por cada cuenta, sea usuario o coach)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'coach')),
  is_approved boolean not null default false,
  full_name text,
  birthdate date,
  country text,
  phone_code text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada quien puede ver únicamente su propia fila
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Cada quien puede actualizar únicamente su propia fila
-- (role e is_approved quedan protegidos por el trigger de abajo)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Protección: nadie desde el cliente puede cambiar su propio role
--    ni is_approved. Solo se puede cambiar manualmente desde el
--    Table Editor de Supabase (ahí tienes permisos de administrador).
create or replace function public.protect_profile_guardrails()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.role := old.role;
    new.is_approved := old.is_approved;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger protect_profile_guardrails
before update on public.profiles
for each row execute function public.protect_profile_guardrails();

-- 3. Al crear una cuenta nueva (signUp), se crea automáticamente su
--    perfil. El "role" viene de la página desde la que se registró
--    (cuenta.html manda role: 'user', entrenador.html manda role: 'coach').
--    is_approved siempre nace en false, sin importar qué mande el cliente.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, is_approved, full_name, birthdate, country, phone_code, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    false,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'birthdate', '')::date,
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'phone_code',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- Opcional: si ya tienes cuentas creadas ANTES de este script
-- (como tu cuenta de prueba), esto las migra a la tabla profiles
-- usando los datos que ya tenían guardados en user_metadata.
-- Bórralo si no lo necesitas.
-- ============================================================
insert into public.profiles (id, role, is_approved, full_name, birthdate, country, phone_code, phone)
select
  id,
  coalesce(raw_user_meta_data->>'role', 'user'),
  true, -- cuentas existentes quedan aprobadas automáticamente
  raw_user_meta_data->>'full_name',
  nullif(raw_user_meta_data->>'birthdate', '')::date,
  raw_user_meta_data->>'country',
  raw_user_meta_data->>'phone_code',
  raw_user_meta_data->>'phone'
from auth.users
on conflict (id) do nothing;
