"use client";
import type { ReactNode } from "react";
import { trackEvent, type ContactSource } from "@/lib/analytics";

export function ContactLink({
  href,
  children,
  className,
  source,
  vehicleId,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  source: ContactSource;
  vehicleId?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackEvent({
          name: "whatsapp_clicked",
          source,
          ...(vehicleId ? { vehicleId } : {}),
        });
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
