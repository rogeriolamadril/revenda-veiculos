"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveVehicle } from "@/app/admin/veiculos/actions";
import type { Vehicle } from "@/lib/database.types";
import { statuses, statusLabels } from "@/lib/validation";
import { Notice } from "./ui";

const fields = [
  { name: "brand", label: "Marca", required: true, maxLength: 80 },
  { name: "model", label: "Modelo", required: true, maxLength: 100 },
  { name: "version", label: "Versão", maxLength: 120 },
  {
    name: "year",
    label: "Ano / modelo",
    required: true,
    type: "number",
    min: 1900,
    max: new Date().getFullYear() + 2,
  },
  {
    name: "mileage",
    label: "Quilometragem (km)",
    required: true,
    type: "number",
    min: 0,
    max: 2147483647,
  },
  {
    name: "price",
    label: "Preço (R$)",
    required: true,
    type: "number",
    min: 0,
    max: 9999999999.99,
    step: "0.01",
  },
  { name: "color", label: "Cor", maxLength: 60 },
  { name: "fuel", label: "Combustível", maxLength: 60 },
  { name: "transmission", label: "Câmbio", maxLength: 60 },
  {
    name: "plate_final",
    label: "Final da placa",
    maxLength: 1,
    pattern: "[0-9]",
  },
] as const;

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action, pending] = useActionState(saveVehicle, {});
  const router = useRouter();
  useEffect(() => {
    if (state.id && !vehicle)
      router.replace(`/admin/veiculos/${state.id}?created=1`);
  }, [state.id, vehicle, router]);
  return (
    <form action={action} className="form-panel glass" aria-busy={pending}>
      <h2>Informações do veículo</h2>
      <p className="muted text-small">
        Campos com * são obrigatórios. Preencha apenas informações reais.
        Opcionais não informados ficam em branco.
      </p>
      {vehicle && (
        <>
          <input type="hidden" name="id" value={vehicle.id} />
          <input type="hidden" name="updated_at" value={vehicle.updated_at} />
        </>
      )}
      <div className="form-grid">
        {fields.map(({ name, label, ...props }) => (
          <label key={name} htmlFor={name}>
            {label}
            {"required" in props && props.required ? " *" : ""}
            <input
              id={name}
              name={name}
              {...props}
              defaultValue={state.values?.[name] ?? vehicle?.[name] ?? ""}
              aria-invalid={Boolean(state.fields?.[name])}
              aria-describedby={
                state.fields?.[name] ? `${name}-error` : undefined
              }
            />
            {state.fields?.[name] && (
              <span id={`${name}-error`} className="field-error">
                {state.fields[name]?.join(" ")}
              </span>
            )}
          </label>
        ))}
        <label>
          Status *
          <select
            name="status"
            defaultValue={
              state.values?.status ?? vehicle?.status ?? "disponivel"
            }
            required
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="field-wide">
          Descrição
          <textarea
            name="description"
            rows={5}
            maxLength={10000}
            defaultValue={
              state.values?.description ?? vehicle?.description ?? ""
            }
          />
        </label>
        <label className="field-wide">
          Opcionais — um por linha
          <textarea
            name="options"
            rows={4}
            maxLength={4000}
            defaultValue={
              state.values?.options ?? vehicle?.options.join("\n") ?? ""
            }
            aria-invalid={Boolean(state.fields?.options)}
          />
          <span className="muted text-small">
            Até 40 opcionais, com até 100 caracteres cada.
          </span>
          {state.fields?.options && (
            <span className="field-error">
              {state.fields.options.join(" ")}
            </span>
          )}
        </label>
      </div>
      {state.error && <Notice error>{state.error}</Notice>}
      {state.success && <Notice>{state.success}</Notice>}
      <div className="form-actions">
        <button
          className="button button-dark"
          disabled={pending || Boolean(state.id && !vehicle)}
        >
          {pending
            ? "Salvando…"
            : vehicle
              ? "Salvar alterações"
              : "Cadastrar e adicionar fotos →"}
        </button>
        <Link className="button button-quiet" href="/admin">
          Voltar ao estoque
        </Link>
      </div>
    </form>
  );
}
