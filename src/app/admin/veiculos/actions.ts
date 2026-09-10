"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { uuidSchema, vehicleSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function saveVehicle(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const values: Record<string, string> = {};
  for (const key of Object.keys(vehicleSchema.shape)) {
    const value = form.get(key);
    if (typeof value === "string") values[key] = value.slice(0, 10000);
  }
  const failure = (error: string): ActionState => ({ error, values });
  try {
    const client = await requireAdmin();
    const parsed = vehicleSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success)
      return {
        error: "Revise os campos indicados.",
        fields: z.flattenError(parsed.error).fieldErrors,
        values,
      };
    const id = form.get("id");
    if (id && !uuidSchema.safeParse(id).success)
      return failure("Veículo inválido.");
    if (typeof id === "string" && id) {
      const updatedAt = z.iso
        .datetime({ offset: true })
        .safeParse(form.get("updated_at"));
      if (!updatedAt.success)
        return failure("Recarregue a página antes de salvar.");
      const result = await client
        .from("vehicles")
        .update(parsed.data)
        .eq("id", id)
        .eq("updated_at", updatedAt.data)
        .select("id")
        .maybeSingle();
      if (result.error)
        return failure("Não foi possível salvar o veículo. Tente novamente.");
      if (!result.data)
        return failure(
          "O veículo foi alterado ou excluído em outra sessão. Recarregue a página antes de editar.",
        );
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath(`/veiculos/${id}`);
      revalidatePath(`/admin/veiculos/${id}`);
      return { success: "Veículo atualizado com sucesso.", id };
    }
    const result = await client
      .from("vehicles")
      .insert(parsed.data)
      .select("id")
      .single();
    if (result.error)
      return failure("Não foi possível cadastrar o veículo. Tente novamente.");
    revalidatePath("/");
    revalidatePath("/admin");
    return {
      success: "Veículo cadastrado. Agora você pode adicionar as fotos.",
      id: result.data.id,
    };
  } catch (error) {
    return failure(
      error instanceof Error &&
        /Sessão expirada|autorização administrativa|verificar sua permissão/.test(
          error.message,
        )
        ? error.message
        : "O serviço está indisponível. Tente novamente.",
    );
  }
}

export async function deleteVehicle(id: string): Promise<ActionState> {
  if (!uuidSchema.safeParse(id).success) return { error: "Veículo inválido." };
  try {
    const client = await requireAdmin();
    // Require image removal first to avoid cross-service partial deletion and orphaned files.
    const photos = await client
      .from("vehicle_images")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", id);
    if (photos.error)
      return { error: "Não foi possível verificar as fotos. Tente novamente." };
    if (photos.count)
      return { error: "Remova as fotos antes de excluir o veículo." };
    // Also check unregistered objects from interrupted uploads. Do not silently discard them.
    const files = await client.storage
      .from("vehicle-images")
      .list(id, { limit: 1 });
    if (files.error)
      return {
        error: "Não foi possível verificar o Storage. Tente novamente.",
      };
    if (files.data.length)
      return {
        error:
          "Há arquivos pendentes neste veículo. Use a limpeza de uploads interrompidos antes de excluir.",
      };
    const result = await client
      .from("vehicles")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (result.error || !result.data)
      return {
        error:
          "Não foi possível excluir o veículo. Recarregue e tente novamente.",
      };
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/veiculos/${id}`);
    return { success: "Veículo excluído." };
  } catch {
    return {
      error:
        "Não foi possível excluir. Verifique sua sessão e tente novamente.",
    };
  }
}
