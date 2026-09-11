import { notFound } from "next/navigation";
import { adminPageClient } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";
import { vehicleTitle } from "@/lib/format";
import { VehicleForm } from "@/components/vehicle-form";
import { PhotoManager } from "@/components/photo-manager";
import { DeleteVehicle } from "@/components/delete-vehicle";
import { Notice } from "@/components/ui";
export default async function EditVehicle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const client = await adminPageClient();
  const { data: vehicle, error } = await client
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Falha ao carregar veículo.");
  if (!vehicle) notFound();
  const query = await searchParams;
  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">ESTOQUE / GERENCIAR</p>
          <h1>{vehicleTitle(vehicle)}</h1>
        </div>
      </div>
      {query.created === "1" && (
        <Notice>Cadastro criado com sucesso. Adicione as fotos abaixo.</Notice>
      )}
      <VehicleForm vehicle={vehicle} />
      <PhotoManager vehicleId={id} images={vehicle.vehicle_images} />
      <DeleteVehicle id={id} />
    </>
  );
}
