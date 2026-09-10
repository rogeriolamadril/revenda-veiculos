"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { MAX_IMAGES, uuidSchema } from "@/lib/validation";
import { normalizeImage } from "@/lib/images";
import type { ActionState } from "@/lib/action-state";

function refresh(id: string) {
  revalidatePath("/");
  revalidatePath(`/veiculos/${id}`);
  revalidatePath(`/admin/veiculos/${id}`);
}
export async function uploadPhoto(form: FormData): Promise<ActionState> {
  const id = uuidSchema.safeParse(form.get("vehicle_id"));
  const file = form.get("file");
  if (!id.success || !(file instanceof File))
    return { error: "Selecione um veículo e uma imagem válidos." };
  try {
    const client = await requireAdmin();
    const vehicle = await client
      .from("vehicles")
      .select("id")
      .eq("id", id.data)
      .maybeSingle();
    if (vehicle.error || !vehicle.data)
      return { error: "Veículo não encontrado ou acesso indisponível." };
    const photos = await client
      .from("vehicle_images")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", id.data);
    if (photos.error)
      return { error: "Não foi possível verificar as fotos existentes." };
    if ((photos.count || 0) >= MAX_IMAGES)
      return { error: "O limite é de 24 fotos por veículo." };
    let content: Buffer;
    try {
      content = await normalizeImage(file);
    } catch {
      return {
        error:
          "Imagem inválida. Use JPEG, PNG ou WebP de até 5 MB e 20 megapixels, sem animação.",
      };
    }
    const path = `${id.data}/${crypto.randomUUID()}.webp`;
    const upload = await client.storage
      .from("vehicle-images")
      .upload(path, content, {
        contentType: "image/webp",
        upsert: false,
        cacheControl: "3600",
      });
    if (upload.error)
      return {
        error:
          "Não foi possível enviar a foto. Verifique sua sessão e tente novamente.",
      };
    const record = await client
      .from("vehicle_images")
      .insert({ vehicle_id: id.data, storage_path: path });
    if (record.error) {
      const cleanup = await client.storage
        .from("vehicle-images")
        .remove([path]);
      return {
        error: cleanup.error
          ? "Falha ao registrar a foto e limpar o arquivo. Use a limpeza de uploads interrompidos."
          : "Não foi possível registrar a foto. O arquivo enviado foi removido; tente novamente.",
      };
    }
    refresh(id.data);
    return { success: "Foto adicionada com sucesso." };
  } catch {
    return {
      error: "Não foi possível enviar. Verifique sua sessão e conexão.",
    };
  }
}
export async function removePhoto(imageId: string): Promise<ActionState> {
  if (!uuidSchema.safeParse(imageId).success)
    return { error: "Foto inválida." };
  try {
    const client = await requireAdmin();
    const photo = await client
      .from("vehicle_images")
      .select("*")
      .eq("id", imageId)
      .maybeSingle();
    if (photo.error || !photo.data)
      return { error: "Foto não encontrada. Recarregue a página." };
    const removed = await client.storage
      .from("vehicle-images")
      .remove([photo.data.storage_path]);
    if (removed.error)
      return { error: "Não foi possível remover o arquivo. Tente novamente." };
    const record = await client
      .from("vehicle_images")
      .delete()
      .eq("id", imageId)
      .select("id")
      .maybeSingle();
    if (record.error || !record.data)
      return {
        error:
          "Arquivo removido, mas o cadastro da foto não foi atualizado. Repita a remoção para concluir.",
      };
    refresh(photo.data.vehicle_id);
    return { success: "Foto removida com sucesso." };
  } catch {
    return {
      error: "Falha ao remover. Verifique sua sessão e tente novamente.",
    };
  }
}
export async function cleanInterruptedUploads(
  id: string,
): Promise<ActionState> {
  if (!uuidSchema.safeParse(id).success) return { error: "Veículo inválido." };
  try {
    const client = await requireAdmin();
    const records = await client
      .from("vehicle_images")
      .select("storage_path")
      .eq("vehicle_id", id);
    if (records.error) return { error: "Não foi possível consultar as fotos." };
    const registered = new Set(records.data.map((p) => p.storage_path));
    // Only remove stale, unregistered files. Recent uploads may still be committing metadata.
    const cutoff = Date.now() - 60 * 60 * 1000;
    const stale: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const list = await client.storage
        .from("vehicle-images")
        .list(id, {
          limit: 100,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
      if (list.error)
        return { error: "Falha ao consultar arquivos pendentes." };
      stale.push(
        ...list.data
          .filter(
            (f) =>
              f.id &&
              f.created_at &&
              new Date(f.created_at).getTime() < cutoff &&
              !registered.has(`${id}/${f.name}`),
          )
          .map((f) => `${id}/${f.name}`),
      );
      if (list.data.length < 100) break;
    }
    if (!stale.length)
      return {
        success: "Nenhum upload interrompido com mais de uma hora encontrado.",
      };
    const removed = await client.storage.from("vehicle-images").remove(stale);
    if (removed.error)
      return {
        error:
          "Não foi possível limpar os arquivos pendentes. Tente novamente.",
      };
    return { success: `${stale.length} arquivo(s) pendente(s) removido(s).` };
  } catch {
    return { error: "Falha na limpeza. Verifique sua sessão." };
  }
}
