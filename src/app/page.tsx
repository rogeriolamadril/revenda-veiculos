import Link from "next/link";
import { getCatalog, PAGE_SIZE } from "@/lib/catalog";
import { parseFilters, type SearchValues } from "@/lib/validation";
import { CatalogFilters } from "@/components/catalog-filters";
import { VehicleCard } from "@/components/vehicle-card";
import { EmptyState, Notice } from "@/components/ui";
import { Pagination } from "@/components/pagination";
import { ArrowIcon } from "@/components/icons";

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
    filters.page > 1,
  );
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> NOVOS CAMINHOS, NOVAS HISTÓRIAS
          </span>
          <h1>
            Seu próximo carro.
            <br />
            <em>Seu próximo capítulo.</em>
          </h1>
          <p>
            Encontre o veículo que combina com o seu momento.
            <br className="desktop-break" /> Explore o estoque e conheça cada
            detalhe, no seu ritmo.
          </p>
          <a className="button button-dark" href="#estoque">
            Explorar veículos <ArrowIcon />
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="road road-one" />
          <div className="road road-two" />
          <div className="road-line" />
          <span className="art-caption">
            SIGA EM FRENTE<span>O próximo caminho é seu.</span>
          </span>
          <div className="art-mark">↗</div>
        </div>
        <div className="hero-foot">
          <span>USADOS & SEMINOVOS</span>
          <span>
            Explore. Escolha. Converse. <span aria-hidden="true">↓</span>
          </span>
        </div>
      </section>
      <section id="estoque" className="shell inventory">
        <CatalogFilters filters={filters} facets={result.facets} />
        <div className="section-heading">
          <div>
            <p className="eyebrow">ESCOLHA O SEU PRÓXIMO CAMINHO</p>
            <h2>
              Veículos disponíveis<span>.</span>
            </h2>
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
          <div className="vehicle-grid">
            {result.vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              active
                ? "Nenhum veículo encontrado"
                : "Novas possibilidades estão a caminho"
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
              ? "Experimente ajustar os filtros para explorar outras opções do estoque."
              : "Ainda não há veículos disponíveis no catálogo. Volte em breve para conferir as próximas novidades."}
          </EmptyState>
        )}
        <Pagination
          page={filters.page}
          totalPages={Math.ceil(result.count / PAGE_SIZE)}
          params={params}
        />
        <div className="catalog-note">
          <span aria-hidden="true">↗</span>
          <p>
            Encontrou o seu próximo carro?
            <br />
            <strong>
              Conheça os detalhes e converse sobre as possibilidades.
            </strong>
          </p>
        </div>
      </section>
    </>
  );
}
