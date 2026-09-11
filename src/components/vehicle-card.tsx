import Link from "next/link";
import Image from "next/image";
import type { VehicleWithImages } from "@/lib/database.types";
import { distance, imageUrl, money, vehicleTitle } from "@/lib/format";
import { NoPhoto } from "./ui";

export function VehicleCard({ vehicle }: { vehicle: VehicleWithImages }) {
  const photo = [...vehicle.vehicle_images].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )[0];
  const url = photo && imageUrl(photo.storage_path);
  const href = `/veiculos/${vehicle.id}`;
  return (
    <article className="public-car-card">
      <Link
        href={href}
        className="public-card-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        {url ? (
          <Image
            src={url}
            alt=""
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />
        ) : (
          <NoPhoto />
        )}
      </Link>
      <div className="public-card-content">
        <h3>
          <Link href={href}>{vehicleTitle(vehicle)}</Link>
        </h3>
        <ul
          className="public-card-specs"
          aria-label="Características principais"
        >
          <li>{vehicle.year}</li>
          <li>{distance(vehicle.mileage)}</li>
          {vehicle.transmission && <li>{vehicle.transmission}</li>}
        </ul>
        <p className="public-card-price">{money(vehicle.price)}</p>
        <Link
          className="button public-card-button"
          href={href}
          aria-label={`Ver veículo: ${vehicleTitle(vehicle)}`}
        >
          Ver veículo <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
