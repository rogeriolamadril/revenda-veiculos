import { z } from "zod";

export const statuses = ["disponivel", "reservado", "vendido"] as const;
export const statusLabels = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);
const numeric = (max: number, integer = false) =>
  z
    .string()
    .trim()
    .min(1, "Campo obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Informe um número positivo válido")
    .transform(Number)
    .pipe(
      integer ? z.number().int().min(0).max(max) : z.number().min(0).max(max),
    );

export const vehicleSchema = z.object({
  brand: z.string().trim().min(1, "Informe a marca").max(80),
  model: z.string().trim().min(1, "Informe o modelo").max(100),
  version: optionalText(120),
  year: numeric(new Date().getFullYear() + 2, true).pipe(z.number().min(1900)),
  mileage: numeric(2147483647, true),
  color: optionalText(60),
  fuel: optionalText(60),
  transmission: optionalText(60),
  plate_final: z
    .string()
    .trim()
    .regex(/^\d?$/, "Informe somente o último dígito")
    .transform((v) => v || null),
  price: numeric(9999999999.99),
  description: optionalText(10000),
  options: z
    .string()
    .max(4000)
    .transform((v) => [
      ...new Set(
        v
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ])
    .pipe(z.array(z.string().max(100)).max(40)),
  status: z.enum(statuses),
});
export type VehicleInput = z.output<typeof vehicleSchema>;
export const uuidSchema = z.string().uuid();

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_IMAGES = 24;
export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export function validateImage(file: { size: number; type: string }) {
  if (!allowedImageTypes.includes(file.type))
    return "Escolha uma imagem JPEG, PNG ou WebP.";
  if (!file.size || file.size > MAX_IMAGE_SIZE)
    return "Cada imagem deve ter até 5 MB e não pode estar vazia.";
  return null;
}

export type SearchValues = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";
export function parseFilters(params: SearchValues) {
  const number = (key: string, max: number) => {
    const raw = first(params[key]);
    return /^\d+(\.\d{1,2})?$/.test(raw) && Number(raw) <= max
      ? Number(raw)
      : undefined;
  };
  const min = number("min", 9999999999.99);
  const max = number("max", 9999999999.99);
  const year = number("year", new Date().getFullYear() + 2);
  const mileage = number("maxMileage", 2147483647);
  return {
    brand: first(params.brand).trim().slice(0, 80),
    model: first(params.model).trim().slice(0, 100),
    transmission: first(params.transmission).trim().slice(0, 60),
    year: year && Number.isInteger(year) && year >= 1900 ? year : undefined,
    min,
    max,
    maxMileage:
      mileage !== undefined && Number.isInteger(mileage) ? mileage : undefined,
    invalidRange: min !== undefined && max !== undefined && min > max,
    page: Math.max(
      1,
      Math.min(100000, Math.floor(number("page", 100000) || 1)),
    ),
  };
}
export type Filters = ReturnType<typeof parseFilters>;
