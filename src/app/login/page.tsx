import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { Notice } from "@/components/ui";
import { supabaseConfig } from "@/lib/config";
export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="shell login-layout">
      <div className="login-copy">
        <p className="eyebrow">GESTÃO DO ESTOQUE</p>
        <h1>
          Tudo pronto para
          <br />o próximo capítulo.
        </h1>
        <p>
          Gerencie veículos, atualize informações e mantenha seu catálogo sempre
          em dia.
        </p>
        {params.reason === "unauthorized" && (
          <Notice error>
            Seu usuário não possui autorização administrativa.
          </Notice>
        )}
      </div>
      <LoginForm configured={Boolean(supabaseConfig())} />
    </div>
  );
}
