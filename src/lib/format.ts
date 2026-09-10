import type { Vehicle } from "./database.types";
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
export const distance = (value: number) =>
  `${new Intl.NumberFormat("pt-BR").format(value)} km`;
export const vehicleTitle = (v: Pick<Vehicle, "brand" | "model" | "version">) =>
  [v.brand, v.model, v.version].filter(Boolean).join(" ");
export function whatsappUrl(
  number: string | undefined,
  vehicle?: Pick<Vehicle, "brand" | "model" | "version" | "year" | "price">,
) {
  if (!number || !/^[+\d\s().-]+$/.test(number)) return null;
  const digits = number.replace(/\D/g, "");
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  const message = vehicle
    ? `Olá! Tenho interesse no ${vehicleTitle(vehicle)} ${vehicle.year} anunciado por ${money(vehicle.price)}. Gostaria de mais informações e de verificar as opções de financiamento.`
    : "Olá! Gostaria de mais informações sobre os veículos disponíveis.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function imageUrl(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/vehicle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}
