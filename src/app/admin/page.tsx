import Link from "next/link";
import { adminPageClient } from "@/lib/auth";
import { money, vehicleTitle } from "@/lib/format";
import {
  parseFilters,
  statuses,
  statusLabels,
  type SearchValues,
} from "@/lib/validation";
import { EmptyState, Notice } from "@/components/ui";
import { LogoutButton } from "@/components/login-form";
import { Pagination } from "@/components/pagination";
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<SearchValues>;
}) {
  const params = await searchParams;
  const { page } = parseFilters(params);
  const client = await adminPageClient();
  const [inventory, ...metrics] = await Promise.all([
    client
      .from("vehicles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * 20, page * 20 - 1),
    ...statuses.map((status) =>
      client
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  ]);
  if (inventory.error || metrics.some((metric) => metric.error))
    throw new Error("Não foi possível carregar o estoque.");
  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">ADMINISTRAÇÃO</p>
          <h1>Visão do estoque</h1>
          <p className="muted text-small">
            Cada veículo, cada detalhe, em um só lugar.
          </p>
        </div>
        <div className="admin-actions">
          <Link className="button button-dark" href="/admin/veiculos/novo">
            + Cadastrar veículo
          </Link>
          <LogoutButton />
        </div>
      </div>
      {params.deleted === "1" && <Notice>Veículo excluído com sucesso.</Notice>}
      <div className="metrics">
        <div className="metric glass">
          <p>Total de veículos</p>
          <strong>{inventory.count ?? 0}</strong>
        </div>
        {statuses.map((status, i) => (
          <div className="metric glass" key={status}>
            <p>{statusLabels[status]}</p>
            <strong>{metrics[i].count ?? 0}</strong>
          </div>
        ))}
      </div>
      {inventory.data?.length ? (
        <div className="table-wrap glass">
          <table>
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Ano</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {inventory.data.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    {vehicleTitle(vehicle)}
                    <small>{vehicle.mileage.toLocaleString("pt-BR")} km</small>
                  </td>
                  <td>{vehicle.year}</td>
                  <td>{money(vehicle.price)}</td>
                  <td>
                    <span className={`status-badge ${vehicle.status}`}>
                      {statusLabels[vehicle.status]}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/veiculos/${vehicle.id}`}>
                      Gerenciar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="O estoque começa aqui"
          action={
            <Link href="/admin/veiculos/novo" className="button button-dark">
              Cadastrar veículo
            </Link>
          }
        >
          Cadastre um veículo real para começar a gerenciar seu estoque.
        </EmptyState>
      )}
      <Pagination
        page={page}
        totalPages={Math.ceil((inventory.count || 0) / 20)}
        params={params}
        base="/admin"
      />
    </>
  );
}
