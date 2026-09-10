-- One SELECT policy per role avoids duplicate permissive policy evaluation.
alter policy catalog_read on public.vehicles to anon;
alter policy admin_read on public.vehicles to authenticated
  using (status = 'disponivel' or (select private.is_admin()));
alter policy catalog_images_read on public.vehicle_images to anon;
alter policy admin_images_read on public.vehicle_images to authenticated
  using ((select private.is_admin()) or exists (
    select 1 from public.vehicles v where v.id = vehicle_id and v.status = 'disponivel'
  ));
