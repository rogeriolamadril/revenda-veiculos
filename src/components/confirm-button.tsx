"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { Notice } from "./ui";

export function ConfirmButton({
  label,
  title,
  description,
  action,
  redirectTo,
}: {
  label: string;
  title: string;
  description: string;
  action: () => Promise<ActionState>;
  redirectTo?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState>({});
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        className="button button-danger"
        onClick={() => {
          setResult({});
          dialog.current?.showModal();
        }}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${label.replace(/\s/g, "")}-title`}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <h2 id={`${label.replace(/\s/g, "")}-title`}>{title}</h2>
        <p>{description}</p>
        {result.error && <Notice error>{result.error}</Notice>}
        <div className="form-actions">
          <button
            className="button button-quiet"
            type="button"
            disabled={pending}
            onClick={() => dialog.current?.close()}
          >
            Cancelar
          </button>
          <button
            className="button button-danger"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const next = await action();
                  setResult(next);
                  if (!next.error) {
                    dialog.current?.close();
                    if (redirectTo) router.push(redirectTo);
                    router.refresh();
                  }
                } catch {
                  setResult({ error: "Falha de conexão. Tente novamente." });
                }
              })
            }
          >
            {pending ? "Processando…" : "Confirmar exclusão"}
          </button>
        </div>
      </dialog>
      {result.success && <Notice>{result.success}</Notice>}
    </>
  );
}
