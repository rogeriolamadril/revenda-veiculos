import Link from "next/link";
import { getCatalog, PAGE_SIZE } from "@/lib/catalog";
import { parseFilters, type SearchValues } from "@/lib/validation";
import { CatalogFilters } from "@/components/catalog-filters";
import { VehicleCard } from "@/components/vehicle-card";
import { EmptyState, Notice } from "@/components/ui";
import { Pagination } from "@/components/pagination";
import { whatsappUrl } from "@/lib/format";
import { ContactLink } from "@/components/contact-link";
import { FloatingContact } from "@/components/floating-contact";

export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchValues>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const result = await getCatalog(filters);
  const active = Boolean(
    filters.brand ||
    filters.model ||
    filters.year ||
    filters.transmission ||
    filters.min !== undefined ||
    filters.max !== undefined ||
    filters.maxMileage !== undefined ||
    filters.page > 1,
  );
  const contact = whatsappUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  return (
    <div className="public-home">
      <section
        className="public-hero public-shell"
        aria-labelledby="catalog-title"
      >
        <p className="public-kicker">USADOS E SEMINOVOS</p>
        <h1 id="catalog-title">
          Encontre seu
          <br />
          <span>próximo carro.</span>
        </h1>
        <p className="hero-description">
          Compare veículos, conheça os detalhes e converse sobre a sua escolha.
        </p>
        <CatalogFilters filters={filters} facets={result.facets} />
      </section>
      <section
        id="estoque"
        className="public-stock public-shell"
        aria-labelledby="stock-title"
      >
        <div className="public-section-heading">
          <div>
            <p className="public-kicker">EXPLORE O ESTOQUE</p>
            <h2 id="stock-title">Veículos disponíveis</h2>
          </div>
          {!result.error && (
            <span className="count-pill">
              {result.count} {result.count === 1 ? "veículo" : "veículos"}
            </span>
          )}
        </div>
        {filters.invalidRange && (
          <Notice error>
            O preço mínimo deve ser menor ou igual ao preço máximo.
          </Notice>
        )}
        {result.error ? (
          <EmptyState
            title="Não foi possível carregar o estoque"
            action={
              <Link className="button button-quiet" href="/">
                Tentar novamente
              </Link>
            }
          >
            {result.error}
          </EmptyState>
        ) : result.vehicles.length ? (
          <div className="public-vehicle-grid">
            {result.vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              active
                ? "Nenhum veículo com esses filtros"
                : "Nenhum veículo disponível no momento"
            }
            action={
              active ? (
                <Link className="button button-quiet" href="/#estoque">
                  Limpar filtros
                </Link>
              ) : undefined
            }
          >
            {active
              ? "Ajuste a busca para conferir outras opções do estoque."
              : "Quando houver veículos disponíveis, você encontrará as fotos e as informações aqui."}
          </EmptyState>
        )}
        <Pagination
          page={filters.page}
          totalPages={Math.ceil(result.count / PAGE_SIZE)}
          params={params}
        />
      </section>
      <section
        id="financiamento"
        className="public-finance-intro public-shell"
        aria-labelledby="finance-intro-title"
      >
        <div>
          <p className="public-kicker">PLANEJE SUA COMPRA</p>
          <h2 id="finance-intro-title">
            Vamos conversar
            <br />
            sobre financiamento?
          </h2>
        </div>
        <div>
          <p>
            Escolha um veículo e leve suas preferências de entrada e prazo para
            uma conversa com o vendedor.
          </p>
          <p className="muted text-small">
            As condições e a disponibilidade de financiamento são confirmadas no
            atendimento.
          </p>
          <a
            className="button button-dark"
            href="#estoque"
            data-contact-surface
          >
            Escolher um veículo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section
        className="public-trust public-shell"
        aria-labelledby="trust-title"
      >
        <p className="public-kicker">DECIDA COM MAIS CLAREZA</p>
        <h2 id="trust-title">Por que comprar conosco?</h2>
        <div className="trust-grid">
          <article>
            <span aria-hidden="true">01</span>
            <h3>Conheça antes de decidir</h3>
            <p>
              Consulte as fotos e as informações cadastradas de cada veículo.
            </p>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <h3>Compare o que importa</h3>
            <p>
              Veja preço, ano, quilometragem e características em um só lugar.
            </p>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <h3>Converse sobre sua escolha</h3>
            <p>Leve suas dúvidas ao vendedor antes de dar o próximo passo.</p>
          </article>
        </div>
      </section>
      <section
        id="contato"
        className="public-contact public-shell"
        data-contact-surface
      >
        <div>
          <h2>Ficou com alguma dúvida?</h2>
          <p>Converse sobre os veículos e as possibilidades de compra.</p>
        </div>
        {contact ? (
          <ContactLink
            className="button button-dark"
            href={contact}
            source="catalog_contact"
          >
            Conversar no WhatsApp ↗
          </ContactLink>
        ) : (
          <p className="muted text-small">
            O atendimento por WhatsApp ainda não está disponível.
          </p>
        )}
      </section>
      <FloatingContact href={contact} />
    </div>
  );
}
