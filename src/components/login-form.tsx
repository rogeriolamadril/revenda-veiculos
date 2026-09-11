"use client";
import { useActionState } from "react";
import { login, logout } from "@/app/login/actions";
import { Notice } from "./ui";
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="login-form glass">
      <p className="eyebrow">ACESSO RESTRITO</p>
      <h2>Entre na administração</h2>
      <p className="muted text-small">
        Use o e-mail autorizado para gerenciar o estoque.
      </p>
      <label htmlFor="email">
        E-mail
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label htmlFor="password">
        Senha
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </label>
      {!configured && (
        <Notice error>
          O acesso administrativo aguarda a configuração do serviço.
        </Notice>
      )}
      {state.error && <Notice error>{state.error}</Notice>}
      <button
        type="submit"
        className="button button-dark"
        disabled={pending || !configured}
      >
        {pending ? "Entrando…" : "Entrar na administração →"}
      </button>
      <p
        className="muted text-small"
        style={{ marginTop: 20, marginBottom: 0 }}
      >
        Precisa de acesso? Solicite autorização ao responsável pela revenda.
      </p>
    </form>
  );
}
export function LogoutButton() {
  const [state, action, pending] = useActionState(logout, {});
  return (
    <form action={action}>
      <button type="submit" className="button button-quiet" disabled={pending}>
        {pending ? "Saindo…" : "Sair"}
      </button>
      {state.error && <Notice error>{state.error}</Notice>}
    </form>
  );
}
