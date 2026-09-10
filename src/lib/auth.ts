import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function requireAdmin() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user)
    throw new Error("Sessão expirada. Entre novamente para continuar.");
  const profile = await client
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile.error)
    throw new Error(
      "Não foi possível verificar sua permissão. Tente novamente.",
    );
  if (!profile.data)
    throw new Error("Este usuário não possui autorização administrativa.");
  return client;
}
export async function adminPageClient() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  const profile = await client
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile.error) throw new Error("Falha ao verificar autorização.");
  if (!profile.data) redirect("/login?reason=unauthorized");
  return client;
}
