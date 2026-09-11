import Link from "next/link";
import { CarIcon } from "./icons";
import { businessName } from "@/lib/config";
import type { ReactNode } from "react";

export function Footer() {
  return (
    <footer className="site-footer" data-contact-surface>
      <span>{businessName}</span>
      <span>Seu próximo caminho começa aqui.</span>
      <Link href="/login">Acesso administrativo</Link>
    </footer>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state glass">
      <span className="empty-icon">
        <CarIcon />
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "notice-error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function NoPhoto() {
  return (
    <div className="no-photo">
      <CarIcon />
      <span>Sem foto cadastrada</span>
    </div>
  );
}
