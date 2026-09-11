"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { businessName } from "@/lib/config";
import { whatsappUrl } from "@/lib/format";
import { CarIcon } from "./icons";

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const admin = pathname.startsWith("/admin") || pathname === "/login";
  const vehicle = pathname.startsWith("/veiculos/");
  const contact = whatsappUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
  if (admin)
    return (
      <header className="site-header glass">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <CarIcon />
          </span>
          <span>
            {businessName}
            <small>USADOS & SEMINOVOS</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal">
          <Link href="/#estoque">Explorar estoque</Link>
          <Link className="nav-admin" href="/login">
            Área administrativa
          </Link>
        </nav>
      </header>
    );
  const links = (
    <>
      <Link href="/#estoque" onClick={close}>
        Veículos
      </Link>
      <Link
        href={vehicle ? "#financiamento" : "/#financiamento"}
        onClick={close}
      >
        Financiamento
      </Link>
      <Link href={vehicle ? "#contato" : "/#contato"} onClick={close}>
        Contato
      </Link>
    </>
  );
  return (
    <header className="public-header">
      <div className="public-header-inner public-shell">
        <Link
          className="public-brand"
          href="/"
          aria-label={`${businessName} — início`}
        >
          <span className="public-brand-icon">
            <CarIcon />
          </span>
          <span>
            {businessName}
            <small>USADOS & SEMINOVOS</small>
          </span>
        </Link>
        <nav className="public-desktop-nav" aria-label="Navegação principal">
          {links}
          {contact && (
            <a
              className="header-contact"
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ↗
            </a>
          )}
        </nav>
        <details
          className="public-mobile-menu"
          ref={menu}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              close();
              menu.current?.querySelector("summary")?.focus();
            }
          }}
        >
          <summary aria-label="Menu de navegação">
            <span>Menu</span>
            <span aria-hidden="true">☰</span>
          </summary>
          <nav aria-label="Navegação móvel">
            {links}
            {contact && (
              <a
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
              >
                Conversar no WhatsApp ↗
              </a>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
