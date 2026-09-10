import Link from "next/link";
export default function NotFound() {
  return (
    <div className="shell page-space">
      <div className="empty-state glass">
        <p className="eyebrow">PÁGINA NÃO ENCONTRADA</p>
        <h1>Este caminho não está disponível.</h1>
        <p>
          O veículo pode ter saído do catálogo ou o endereço pode estar
          incorreto.
        </p>
        <Link className="button button-dark" href="/">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
