"use client";
import { useEffect, useState } from "react";
import { ContactLink } from "./contact-link";

export function FloatingContact({
  href,
  vehicleId,
}: {
  href: string | null;
  vehicleId?: string;
}) {
  const [covered, setCovered] = useState(true);
  useEffect(() => {
    if (!href || !window.IntersectionObserver) return;
    const visible = new Set<Element>();
    // Hide near in-page contact actions and financing fields rather than compete with them.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        setCovered(visible.size > 0);
      },
      { rootMargin: "0px 0px 90px 0px" },
    );
    document
      .querySelectorAll("[data-contact-surface]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [href, vehicleId]);
  if (!href || covered) return null;
  return (
    <div className="floating-contact">
      <ContactLink
        href={href}
        vehicleId={vehicleId}
        source="floating_contact"
        className="button button-dark"
      >
        {vehicleId ? "Tenho interesse" : "WhatsApp"}{" "}
        <span aria-hidden="true">↗</span>
      </ContactLink>
    </div>
  );
}
