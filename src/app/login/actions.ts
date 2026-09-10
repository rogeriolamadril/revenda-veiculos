"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";

export async function login(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ email: z.email().max(254), password: z.string().min(1).max(256) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: "Informe um e-mail válido e sua senha." };
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword(parsed.data);
    if (error || !data.user)
      return {
        error:
          "Não foi possível entrar. Verifique e-mail e senha ou tente novamente mais tarde.",
      };
    const profile = await client
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (profile.error || !profile.data) {
      await client.auth.signOut({ scope: "local" });
      return {
        error: profile.error
          ? "Não foi possível verificar sua permissão. Tente novamente."
          : "Este usuário não possui autorização administrativa.",
      };
    }
  } catch {
    return {
      error:
        "O acesso está temporariamente indisponível. Tente novamente em instantes.",
    };
  }
  redirect("/admin");
}
export async function logout(): Promise<ActionState> {
  try {
    const client = await createClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error)
      return { error: "Não foi possível encerrar a sessão. Tente novamente." };
  } catch {
    return { error: "Não foi possível encerrar a sessão. Tente novamente." };
  }
  redirect("/login");
}
