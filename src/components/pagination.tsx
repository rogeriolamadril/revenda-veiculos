import Link from "next/link";
import type { SearchValues } from "@/lib/validation";
export function Pagination({
  page,
  totalPages,
  params,
  base = "/",
}: {
  page: number;
  totalPages: number;
  params: SearchValues;
  base?: string;
}) {
  if (totalPages <= 1 && page <= 1) return null;
  const href = (next: number) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (typeof v === "string" && k !== "page") query.set(k, v);
    });
    query.set("page", String(next));
    return `${base}?${query}${base === "/" ? "#estoque" : ""}`;
  };
  return (
    <nav className="pagination" aria-label="Paginação" data-contact-surface>
      {page > 1 && (
        <Link className="button button-quiet" href={href(page - 1)}>
          ← Anterior
        </Link>
      )}
      <span>
        Página {page}
        {totalPages ? ` de ${totalPages}` : ""}
      </span>
      {page < totalPages && (
        <Link className="button button-quiet" href={href(page + 1)}>
          Próxima →
        </Link>
      )}
    </nav>
  );
}
