"use client";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
export function VehicleViewEvent({ vehicleId }: { vehicleId: string }) {
  const lastId = useRef<string | null>(null);
  useEffect(() => {
    if (lastId.current === vehicleId) return;
    lastId.current = vehicleId;
    trackEvent({ name: "vehicle_view", vehicleId });
  }, [vehicleId]);
  return null;
}
