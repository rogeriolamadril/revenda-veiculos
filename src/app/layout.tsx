import type { Metadata } from "next";
import { businessName } from "@/lib/config";
import { Footer } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "./public.css";

export const metadata: Metadata = {
  title: {
    default: `${businessName} | Usados e seminovos`,
    template: `%s | ${businessName}`,
  },
  description:
    "Explore os veículos disponíveis, conheça cada detalhe e converse sobre seu próximo carro.",
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  openGraph: {
    title: businessName,
    description: "Usados e seminovos. Explore o estoque disponível.",
    locale: "pt_BR",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
