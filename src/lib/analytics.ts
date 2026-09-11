export type ContactSource =
  | "header"
  | "catalog_contact"
  | "vehicle_primary"
  | "vehicle_contact"
  | "floating_contact"
  | "financing";
export type AnalyticsEvent =
  | { name: "vehicle_view"; vehicleId: string }
  | { name: "financing_started"; vehicleId: string }
  | { name: "whatsapp_clicked"; source: ContactSource; vehicleId?: string }
  | { name: "lead_submitted"; vehicleId: string };
export type AnalyticsSink = (event: AnalyticsEvent) => void;

// Explicit future adapter boundary. No network, storage, queue, console or personal/financial data.
// lead_submitted is reserved; opening WhatsApp does NOT mean a lead was submitted.
export function createAnalyticsTracker(sink?: AnalyticsSink) {
  return (event: AnalyticsEvent): void => {
    try {
      sink?.(event);
    } catch {
      /* Optional analytics must never block navigation or contact. */
    }
  };
}
export const trackEvent = createAnalyticsTracker();
