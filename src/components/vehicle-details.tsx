import Link from "next/link";
import type { VehicleWithImages } from "@/lib/database.types";
import {
  distance,
  imageUrl,
  money,
  vehicleTitle,
  whatsappUrl,
} from "@/lib/format";
import { Gallery } from "./gallery";

export function VehicleDetails({ vehicle }: { vehicle: VehicleWithImages }) {
  const images = [...vehicle.vehicle_images]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((i) => imageUrl(i.storage_path))
    .filter((v): v is string => Boolean(v));
  const contact = whatsappUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, vehicle);
  const specs = [
    ["Ano / modelo", vehicle.year],
    ["Quilometragem", distance(vehicle.mileage)],
    ["Câmbio", vehicle.transmission],
    ["Combustível", vehicle.fuel],
    ["Cor", vehicle.color],
  ].filter(([, value]) => value !== null);
  return (
    <article className="public-vehicle">
      <div className="public-shell">
        <Link className="public-back" href="/#estoque">
          ← Voltar aos veículos
        </Link>
        <div className="public-detail-top">
          <Gallery images={images} title={vehicleTitle(vehicle)} />
          <header className="public-vehicle-summary">
            <p className="public-kicker">{vehicle.brand}</p>
            <h1>{vehicleTitle(vehicle)}</h1>
            <p className="public-vehicle-price">{money(vehicle.price)}</p>
            <p className="muted public-summary-specs">
              {vehicle.year} · {distance(vehicle.mileage)}
              {vehicle.transmission ? ` · ${vehicle.transmission}` : ""}
            </p>
            <div className="public-primary-actions" data-contact-surface>
              {contact ? (
                <a
                  className="button button-dark"
                  href={contact}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tenho interesse <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p className="contact-unavailable">
                  O atendimento por WhatsApp ainda não está disponível.
                </p>
              )}
              <a href="#financiamento" className="button button-quiet">
                Simular financiamento
              </a>
            </div>
          </header>
        </div>
        <div className="public-detail-body">
          <section aria-labelledby="specifications-title">
            <h2 id="specifications-title">Conheça os detalhes</h2>
            <dl className="public-specifications">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {vehicle.description && (
            <section aria-labelledby="description-title">
              <h2 id="description-title">Sobre este veículo</h2>
              <p className="description">{vehicle.description}</p>
            </section>
          )}
          {vehicle.options.length > 0 && (
            <section aria-labelledby="options-title">
              <h2 id="options-title">Opcionais</h2>
              <ul className="public-options">
                {vehicle.options.map((option) => (
                  <li key={option}>
                    <span aria-hidden="true">✓</span> {option}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section id="financiamento" className="public-finance-intro">
            <div>
              <p className="public-kicker">PLANEJE SUA COMPRA</p>
              <h2>Converse sobre financiamento</h2>
            </div>
            <p>
              Informe seus dados de financiamento com um vendedor para receber
              uma simulação personalizada.
            </p>
          </section>
          <section
            id="contato"
            className="public-detail-contact"
            data-contact-surface
          >
            <h2>Este pode ser o seu próximo carro.</h2>
            <p>Tire suas dúvidas e converse com o vendedor antes de decidir.</p>
            {contact ? (
              <a
                className="button button-dark"
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tenho interesse ↗
              </a>
            ) : (
              <p className="muted">
                O atendimento por WhatsApp ainda não está disponível.
              </p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
