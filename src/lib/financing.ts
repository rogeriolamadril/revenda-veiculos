import type { Vehicle } from "./database.types";
import { money, vehicleTitle, whatsappMessageUrl } from "./format";

export type FinancingVehicle = Pick<
  Vehicle,
  "id" | "brand" | "model" | "version" | "year" | "price"
>;
export const financingTerms = [24, 36, 48, 60] as const;
export type FinancingTerm = (typeof financingTerms)[number];
export type FinancingPreferences = {
  downPayment?: number;
  term: FinancingTerm;
};
export type FinancingDraft = { downPayment: string; term: string };
export type FinancingValidation =
  | { valid: true; preferences: FinancingPreferences }
  | { valid: false; field: "downPayment" | "term"; message: string };

// Preferences only. No interest rate, installments, credit decision or persistence.
export function validateFinancingDraft(
  draft: FinancingDraft,
  vehiclePrice: number,
): FinancingValidation {
  const raw = draft.downPayment.trim().replace(",", ".");
  if (
    !Number.isFinite(vehiclePrice) ||
    vehiclePrice < 0 ||
    vehiclePrice > 9999999999.99
  ) {
    return {
      valid: false,
      field: "downPayment",
      message: "Não foi possível confirmar o valor do veículo.",
    };
  }
  let downPayment: number | undefined;
  if (raw !== "") {
    if (!/^\d+(\.\d{1,2})?$/.test(raw))
      return {
        valid: false,
        field: "downPayment",
        message: "Informe uma entrada válida, com até duas casas decimais.",
      };
    downPayment = Number(raw);
    if (!Number.isFinite(downPayment) || downPayment > vehiclePrice)
      return {
        valid: false,
        field: "downPayment",
        message: "A entrada não pode ser maior que o valor do veículo.",
      };
  }
  const term = financingTerms.find((value) => String(value) === draft.term);
  if (!term)
    return {
      valid: false,
      field: "term",
      message: "Selecione um dos prazos disponíveis.",
    };
  return { valid: true, preferences: { downPayment, term } };
}

export function financingWhatsAppUrl(
  number: string | undefined,
  vehicle: FinancingVehicle,
  draft: FinancingDraft,
) {
  const parsed = validateFinancingDraft(draft, vehicle.price);
  if (!parsed.valid) return null;
  const { downPayment, term } = parsed.preferences;
  const lines = [
    `Olá! Quero simular o financiamento do ${vehicleTitle(vehicle)} ${vehicle.year}, anunciado por ${money(vehicle.price)}.`,
    ...(downPayment === undefined
      ? []
      : [`Entrada pretendida: ${money(downPayment)}.`]),
    `Prazo desejado: ${term} meses.`,
    "Gostaria de consultar as condições disponíveis e receber uma simulação personalizada.",
  ];
  return whatsappMessageUrl(number, lines.join(" "));
}
