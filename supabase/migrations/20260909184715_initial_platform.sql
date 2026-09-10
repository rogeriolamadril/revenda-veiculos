-- No seed data. Administrator authorization is a separate, explicit operation.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;
create policy admin_self_read on public.admin_profiles for select to authenticated
  using (user_id = (select auth.uid()));

-- Invoker: the admin lookup itself is protected by the simple, nonrecursive policy above.
create function private.is_admin() returns boolean language sql stable security invoker
set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.admin_profiles where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (length(btrim(brand)) between 1 and 80),
  model text not null check (length(btrim(model)) between 1 and 100),
  version text check (length(version) <= 120),
  year integer not null check (year between 1900 and 2100),
  mileage integer not null check (mileage >= 0),
  color text check (length(color) <= 60),
  fuel text check (length(fuel) <= 60),
  transmission text check (length(transmission) <= 60),
  plate_final text check (plate_final ~ '^[0-9]$'),
  price numeric(12,2) not null check (price >= 0 and price < 10000000000),
  description text check (length(description) <= 10000),
  options text[] not null default '{}' check (cardinality(options) <= 40 and array_position(options, null) is null),
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicles_status_created_idx on public.vehicles(status, created_at desc, id);
create index vehicles_catalog_price_idx on public.vehicles(price) where status = 'disponivel';

create function private.touch_vehicle() returns trigger language plpgsql security invoker
set search_path = '' as $$
begin
  new.updated_at = clock_timestamp();
  new.created_at = old.created_at;
  return new;
end;
$$;
create trigger vehicle_updated before update on public.vehicles for each row execute function private.touch_vehicle();
revoke all on function private.touch_vehicle() from public;

alter table public.vehicles enable row level security;
revoke all on public.vehicles from anon, authenticated;
grant select on public.vehicles to anon, authenticated;
grant insert, update, delete on public.vehicles to authenticated;
create policy catalog_read on public.vehicles for select to anon, authenticated using (status = 'disponivel');
create policy admin_read on public.vehicles for select to authenticated using ((select private.is_admin()));
create policy admin_insert on public.vehicles for insert to authenticated with check ((select private.is_admin()));
create policy admin_update on public.vehicles for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admin_delete on public.vehicles for delete to authenticated using ((select private.is_admin()));

create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  constraint safe_image_path check (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.]webp$'
    and split_part(storage_path, '/', 1) = vehicle_id::text
  )
);
create index vehicle_images_vehicle_idx on public.vehicle_images(vehicle_id, created_at, id);
alter table public.vehicle_images enable row level security;
revoke all on public.vehicle_images from anon, authenticated;
grant select on public.vehicle_images to anon, authenticated;
grant insert, delete on public.vehicle_images to authenticated;
create policy catalog_images_read on public.vehicle_images for select to anon, authenticated
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.status = 'disponivel'));
create policy admin_images_read on public.vehicle_images for select to authenticated using ((select private.is_admin()));
create policy admin_images_insert on public.vehicle_images for insert to authenticated with check ((select private.is_admin()));
create policy admin_images_delete on public.vehicle_images for delete to authenticated using ((select private.is_admin()));

create function private.limit_vehicle_images() returns trigger language plpgsql security invoker
set search_path = '' as $$
begin
  perform id from public.vehicles where id = new.vehicle_id for update;
  if (select count(*) from public.vehicle_images where vehicle_id = new.vehicle_id) >= 24 then
    raise exception 'Maximum image count exceeded' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger limit_images before insert on public.vehicle_images for each row execute function private.limit_vehicle_images();
revoke all on function private.limit_vehicle_images() from public;

-- Full-stock filter options, independent of catalog pagination. Invoker preserves RLS.
create function public.catalog_facets() returns table(kind text, value text)
language sql stable security invoker set search_path = '' as $$
  select distinct f.kind, f.value from public.vehicles v
  cross join lateral (values ('brand', v.brand), ('model', v.model), ('year', v.year::text), ('transmission', v.transmission)) f(kind, value)
  where v.status = 'disponivel' and f.value is not null
  order by f.kind, f.value;
$$;
revoke all on function public.catalog_facets() from public;
grant execute on function public.catalog_facets() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 5242880, array['image/webp']);
-- Public bucket: all uploaded vehicle photos are public assets, including old links.
-- Metadata for reserved/sold vehicles remains hidden by RLS. Never upload private documents.
create policy admin_storage_read on storage.objects for select to authenticated
  using (bucket_id = 'vehicle-images' and (select private.is_admin()));
create policy admin_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'vehicle-images' and (select private.is_admin())
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.]webp$'
    and exists (select 1 from public.vehicles where id::text = split_part(name, '/', 1)));
create policy admin_storage_update on storage.objects for update to authenticated
  using (bucket_id = 'vehicle-images' and (select private.is_admin()))
  with check (bucket_id = 'vehicle-images' and (select private.is_admin())
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.]webp$'
    and exists (select 1 from public.vehicles where id::text = split_part(name, '/', 1)));
create policy admin_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'vehicle-images' and (select private.is_admin()));
