import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { catalogClient } from "@/lib/catalog";
import { uuidSchema } from "@/lib/validation";
import { vehicleTitle } from "@/lib/format";
import { VehicleDetails } from "@/components/vehicle-details";

export const dynamic = "force-dynamic";
const getVehicle = cache(async (id: string) => {
  if (!uuidSchema.safeParse(id).success) notFound();
  const client = catalogClient();
  if (!client) throw new Error("Catálogo indisponível");
  const { data, error } = await client
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("id", id)
    .eq("status", "disponivel")
    .maybeSingle();
  if (error) throw new Error("Falha ao carregar veículo");
  if (!data) notFound();
  return data;
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const vehicle = await getVehicle((await params).id);
  return {
    title: `${vehicleTitle(vehicle)} ${vehicle.year}`,
    description:
      vehicle.description?.slice(0, 160) ||
      `Veja os detalhes de ${vehicleTitle(vehicle)} e converse sobre as opções de financiamento.`,
  };
}
export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const vehicle = await getVehicle((await params).id);
  return <VehicleDetails vehicle={vehicle} />;
}
