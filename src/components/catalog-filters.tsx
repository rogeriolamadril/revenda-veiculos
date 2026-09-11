import Link from "next/link";
import type { Filters } from "@/lib/validation";

export function CatalogFilters({
  filters,
  facets,
}: {
  filters: Filters;
  facets: { kind: string; value: string }[];
}) {
  const options = (kind: string) =>
    facets
      .filter((f) => f.kind === kind)
      .map((f) => (
        <option key={f.value} value={f.value}>
          {f.value}
        </option>
      ));
  const advancedCount = [
    filters.year,
    filters.transmission || undefined,
    filters.maxMileage,
  ].filter((v) => v !== undefined).length;
  return (
    <form
      action="/#estoque"
      className="public-search"
      role="search"
      aria-label="Buscar veículos"
    >
      <div className="quick-search-fields">
        <label>
          Marca
          <select name="brand" defaultValue={filters.brand}>
            <option value="">Todas as marcas</option>
            {options("brand")}
          </select>
        </label>
        <label>
          Modelo
          <select name="model" defaultValue={filters.model}>
            <option value="">Todos os modelos</option>
            {options("model")}
          </select>
        </label>
        <fieldset className="price-range">
          <legend>Faixa de preço (R$)</legend>
          <div>
            <label>
              <span className="sr-only">Preço mínimo (R$)</span>
              <input
                name="min"
                type="number"
                inputMode="decimal"
                min="0"
                max="9999999999.99"
                step="0.01"
                placeholder="De"
                defaultValue={filters.min}
              />
            </label>
            <span aria-hidden="true">—</span>
            <label>
              <span className="sr-only">Preço máximo (R$)</span>
              <input
                name="max"
                type="number"
                inputMode="decimal"
                min="0"
                max="9999999999.99"
                step="0.01"
                placeholder="Até"
                defaultValue={filters.max}
              />
            </label>
          </div>
        </fieldset>
        <button className="button button-dark search-button" type="submit">
          Buscar veículos <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="search-bottom">
        <details className="advanced-filters" open={advancedCount > 0}>
          <summary>
            Mais filtros
            {advancedCount ? (
              <span className="filter-count">{advancedCount} ativos</span>
            ) : null}
            <span className="filter-toggle" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="advanced-grid">
            <label>
              Ano / modelo
              <select name="year" defaultValue={filters.year || ""}>
                <option value="">Todos os anos</option>
                {options("year")}
              </select>
            </label>
            <label>
              Câmbio
              <select name="transmission" defaultValue={filters.transmission}>
                <option value="">Todos os câmbios</option>
                {options("transmission")}
              </select>
            </label>
            <label>
              Quilometragem máxima (km)
              <input
                name="maxMileage"
                type="number"
                inputMode="numeric"
                min="0"
                max="2147483647"
                step="1"
                placeholder="Sem limite"
                defaultValue={filters.maxMileage}
              />
            </label>
          </div>
        </details>
        <Link className="clear-search" href="/#estoque">
          Limpar busca
        </Link>
      </div>
    </form>
  );
}
