import { VehicleForm } from "@/components/vehicle-form";
export default function NewVehicle() {
  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">ESTOQUE / NOVO VEÍCULO</p>
          <h1>Cadastrar veículo</h1>
          <p className="muted text-small">
            Salve o cadastro para adicionar as fotos no próximo passo.
          </p>
        </div>
      </div>
      <VehicleForm />
    </>
  );
}
