import Link from "next/link";
import Image from "next/image";
import type { VehicleWithImages } from "@/lib/database.types";
import { distance, imageUrl, money, vehicleTitle } from "@/lib/format";
import { ArrowIcon } from "./icons";
import { NoPhoto } from "./ui";

export function VehicleCard({ vehicle }: { vehicle: VehicleWithImages }) {
  const photo = [...vehicle.vehicle_images].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )[0];
  const url = photo && imageUrl(photo.storage_path);
  return (
    <article className="vehicle-card glass">
      <Link href={`/veiculos/${vehicle.id}`} className="card-link">
        <div className="card-photo">
          {url ? (
            <Image
              src={url}
              alt={vehicleTitle(vehicle)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
            />
          ) : (
            <NoPhoto />
          )}
          <span className="photo-label">Disponível</span>
        </div>
        <div className="card-body">
          <p className="eyebrow">{vehicle.brand}</p>
          <h3>{vehicle.model}</h3>
          {vehicle.version && <p className="muted">{vehicle.version}</p>}
          <div className="card-specs">
            <span>{vehicle.year}</span>
            <span>{distance(vehicle.mileage)}</span>
            {vehicle.transmission && <span>{vehicle.transmission}</span>}
          </div>
          <div className="card-bottom">
            <strong>{money(vehicle.price)}</strong>
            <span className="circle-button" aria-label="Visualizar detalhes">
              <ArrowIcon />
            </span>
          </div>
          <span className="card-cta">Visualizar detalhes</span>
        </div>
      </Link>
    </article>
  );
}
