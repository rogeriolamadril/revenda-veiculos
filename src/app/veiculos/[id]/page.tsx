import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { catalogClient } from "@/lib/catalog";
import { uuidSchema } from "@/lib/validation";
import {
  distance,
  imageUrl,
  money,
  vehicleTitle,
  whatsappUrl,
} from "@/lib/format";
import { Gallery } from "@/components/gallery";

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
  const images = [...vehicle.vehicle_images]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((i) => imageUrl(i.storage_path))
    .filter((v): v is string => Boolean(v));
  const whatsapp = whatsappUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    vehicle,
  );
  const specs = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Versão", vehicle.version],
    ["Ano / modelo", vehicle.year],
    ["Quilometragem", distance(vehicle.mileage)],
    ["Cor", vehicle.color],
    ["Combustível", vehicle.fuel],
    ["Câmbio", vehicle.transmission],
    ["Final da placa", vehicle.plate_final],
  ].filter(([, value]) => value !== null);
  return (
    <div className="shell page-space">
      <Link className="back-link" href="/#estoque">
        ← Voltar ao estoque
      </Link>
      <div className="detail-layout">
        <div>
          <Gallery images={images} title={vehicleTitle(vehicle)} />
          <section className="detail-section">
            <p className="eyebrow">CADA DETALHE IMPORTA</p>
            <h2>Sobre o veículo</h2>
            <dl className="spec-grid">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {vehicle.description && (
              <p className="description">{vehicle.description}</p>
            )}
          </section>
          {vehicle.options.length > 0 && (
            <section className="detail-section">
              <h2>Opcionais</h2>
              <ul className="chips">
                {vehicle.options.map((option) => (
                  <li key={option}>✓ {option}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="detail-summary glass">
          <span className="status-badge disponivel">Disponível</span>
          <p className="eyebrow">{vehicle.brand}</p>
          <h1>{vehicle.model}</h1>
          {vehicle.version && <p className="muted">{vehicle.version}</p>}
          <p className="detail-year">
            {vehicle.year} <span>·</span> {distance(vehicle.mileage)}
          </p>
          <p className="detail-price">{money(vehicle.price)}</p>
          {whatsapp ? (
            <a
              className="button button-dark interest-button"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tenho Interesse / Simular Financiamento{" "}
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p className="notice">
              O atendimento por WhatsApp ainda não está disponível.
            </p>
          )}
          <p className="muted text-small">
            Converse sobre o veículo e consulte as possibilidades de
            financiamento.
          </p>
        </aside>
      </div>
    </div>
  );
}
