import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
import type { Database } from "./database.types";
import type { Filters } from "./validation";

export const PAGE_SIZE = 12;
// Public catalog always uses anonymous access, even when an admin is signed in.
export function catalogClient() {
  const config = supabaseConfig();
  if (!config) return null;
  return createSupabaseClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function getCatalog(filters: Filters) {
  const client = catalogClient();
  if (!client)
    return {
      vehicles: [],
      count: 0,
      facets: [],
      error:
        "O catálogo está temporariamente indisponível. Tente novamente mais tarde.",
    };
  let query = client
    .from("vehicles")
    .select("*, vehicle_images(*)", { count: "exact" })
    .eq("status", "disponivel");
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.model) query = query.eq("model", filters.model);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.transmission)
    query = query.eq("transmission", filters.transmission);
  if (filters.min !== undefined) query = query.gte("price", filters.min);
  if (filters.max !== undefined) query = query.lte("price", filters.max);
  if (filters.maxMileage !== undefined)
    query = query.lte("mileage", filters.maxMileage);
  const [vehicles, facets] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .order("id")
      .range((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE - 1),
    client.rpc("catalog_facets"),
  ]);
  if (vehicles.error || facets.error)
    return {
      vehicles: [],
      count: 0,
      facets: [],
      error:
        "Não foi possível carregar o catálogo. Tente novamente em instantes.",
    };
  return {
    vehicles: vehicles.data || [],
    count: vehicles.count || 0,
    facets: facets.data || [],
    error: null,
  };
}
