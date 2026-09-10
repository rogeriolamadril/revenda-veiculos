"use client";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VehicleImage } from "@/lib/database.types";
import { imageUrl } from "@/lib/format";
import { MAX_IMAGES, validateImage } from "@/lib/validation";
import {
  cleanInterruptedUploads,
  removePhoto,
  uploadPhoto,
} from "@/app/admin/veiculos/photos";
import { ConfirmButton } from "./confirm-button";
import { Notice } from "./ui";
import type { ActionState } from "@/lib/action-state";

export function PhotoManager({
  vehicleId,
  images,
}: {
  vehicleId: string;
  images: VehicleImage[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [state, setState] = useState<ActionState>({});
  const [progress, setProgress] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);
  return (
    <section className="form-panel glass photo-manager">
      <h2>Fotos do veículo</h2>
      <p className="muted text-small">
        A primeira foto enviada será a capa. JPEG, PNG ou WebP, até 5 MB e 20
        megapixels por foto. Máximo de 24 fotos. As fotos são públicas; não
        envie documentos pessoais.
      </p>
      <div className="photo-grid">
        {[...images]
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map((photo, i) => {
            const src = imageUrl(photo.storage_path);
            return (
              <div className="photo-item" key={photo.id}>
                {src && (
                  <Image
                    src={src}
                    alt={`Foto ${i + 1}${i === 0 ? " — capa" : ""}`}
                    width={240}
                    height={150}
                  />
                )}
                <ConfirmButton
                  label={`Remover foto ${i + 1}`}
                  title="Remover esta foto?"
                  description="O arquivo será excluído permanentemente."
                  action={() => removePhoto(photo.id)}
                />
              </div>
            );
          })}
      </div>
      {!images.length && <p className="muted">Sem foto cadastrada</p>}
      <div className="upload-box">
        <label>
          Selecionar fotos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={pending || images.length >= MAX_IMAGES}
            onChange={(event) => {
              const selected = Array.from(event.target.files || []);
              const error = selected.map(validateImage).find(Boolean);
              if (error || selected.length + images.length > MAX_IMAGES) {
                setState({
                  error: error || "O limite é de 24 fotos por veículo.",
                });
                setFiles([]);
                setPreviews([]);
                event.target.value = "";
                return;
              }
              setState({});
              setFiles(selected);
              setPreviews(selected.map((file) => URL.createObjectURL(file)));
            }}
          />
        </label>
        {previews.length > 0 && (
          <div className="upload-previews">
            {previews.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`Prévia da foto ${i + 1}`}
                width={95}
                height={75}
                unoptimized
              />
            ))}
          </div>
        )}
        <button
          type="button"
          className="button button-dark"
          style={{ marginTop: 20 }}
          disabled={pending || !files.length}
          onClick={() =>
            startTransition(async () => {
              setState({});
              let completed = 0;
              try {
                for (const file of files) {
                  setProgress(
                    `Enviando foto ${completed + 1} de ${files.length}…`,
                  );
                  const form = new FormData();
                  form.set("vehicle_id", vehicleId);
                  form.set("file", file);
                  const result = await uploadPhoto(form);
                  if (result.error) {
                    setState({
                      error: `${completed} foto(s) enviada(s). ${result.error}`,
                    });
                    setFiles([]);
                    setPreviews([]);
                    router.refresh();
                    return;
                  }
                  completed++;
                }
                setState({ success: `${completed} foto(s) adicionada(s).` });
                setFiles([]);
                setPreviews([]);
                router.refresh();
              } catch {
                setState({
                  error:
                    "A conexão foi interrompida. Recarregue a página e confira as fotos antes de reenviar.",
                });
                setFiles([]);
                setPreviews([]);
              } finally {
                setProgress("");
              }
            })
          }
        >
          {pending ? "Enviando…" : "Enviar fotos selecionadas"}
        </button>
        <p aria-live="polite" className="muted text-small">
          {progress}
        </p>
      </div>
      {state.error && <Notice error>{state.error}</Notice>}
      {state.success && <Notice>{state.success}</Notice>}
      <details style={{ marginTop: 22 }}>
        <summary className="muted text-small">
          Recuperar uploads interrompidos
        </summary>
        <p className="muted text-small">
          Remove somente arquivos não vinculados ao cadastro e enviados há mais
          de uma hora.
        </p>
        <ConfirmButton
          label="Limpar uploads interrompidos"
          title="Limpar arquivos pendentes?"
          description="Somente arquivos sem vínculo e com mais de uma hora serão removidos."
          action={() => cleanInterruptedUploads(vehicleId)}
        />
      </details>
    </section>
  );
}
