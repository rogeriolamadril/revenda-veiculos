"use client";
import { deleteVehicle } from "@/app/admin/veiculos/actions";
import { ConfirmButton } from "./confirm-button";
export function DeleteVehicle({ id }: { id: string }) {
  return (
    <div className="danger-zone">
      <h2>Excluir veículo</h2>
      <p className="muted text-small">
        Remova as fotos antes de excluir o cadastro. Esta ação é permanente.
      </p>
      <ConfirmButton
        label="Excluir veículo"
        title="Excluir este veículo?"
        description="O cadastro será removido definitivamente do estoque e do catálogo."
        action={() => deleteVehicle(id)}
        redirectTo="/admin?deleted=1"
      />
    </div>
  );
}
