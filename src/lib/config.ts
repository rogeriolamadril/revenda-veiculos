export const businessName =
  process.env.NEXT_PUBLIC_BUSINESS_NAME?.trim() || "Catálogo de veículos";

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    if (key.startsWith("sb_secret_")) return null;
    // Legacy JWT keys must be anonymous keys, never service_role.
    if (!key.startsWith("sb_publishable_")) {
      const payload: unknown = JSON.parse(atob(key.split(".")[1] || ""));
      if (
        !payload ||
        typeof payload !== "object" ||
        !("role" in payload) ||
        payload.role !== "anon"
      )
        return null;
    }
    return { url, key };
  } catch {
    return null;
  }
}
