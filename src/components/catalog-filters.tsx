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
  return (
    <form action="/#estoque" className="filter-panel glass">
      <div className="filter-heading">
        <span className="eyebrow">ENCONTRE O SEU PRÓXIMO VEÍCULO</span>
        <Link href="/#estoque">Limpar filtros ↗</Link>
      </div>
      <div className="filter-grid">
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
          Preço mínimo (R$)
          <input
            type="number"
            name="min"
            min="0"
            max="9999999999.99"
            step="0.01"
            placeholder="Sem mínimo"
            defaultValue={filters.min}
          />
        </label>
        <label>
          Preço máximo (R$)
          <input
            type="number"
            name="max"
            min="0"
            max="9999999999.99"
            step="0.01"
            placeholder="Sem máximo"
            defaultValue={filters.max}
          />
        </label>
        <button className="button button-dark filter-submit" type="submit">
          Buscar veículos <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
