"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell page-space">
      <div className="empty-state glass" role="alert">
        <h1>Não foi possível continuar</h1>
        <p>
          Ocorreu uma falha ao carregar esta página. Tente novamente em
          instantes.
        </p>
        <button className="button button-dark" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
