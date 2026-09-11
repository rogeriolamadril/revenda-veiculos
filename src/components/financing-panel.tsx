"use client";
import { useRef, useState } from "react";
import { money } from "@/lib/format";
import {
  financingTerms,
  financingWhatsAppUrl,
  validateFinancingDraft,
  type FinancingVehicle,
} from "@/lib/financing";
import { trackEvent } from "@/lib/analytics";
import { ContactLink } from "./contact-link";

export function FinancingPanel({
  vehicle,
  whatsappNumber,
}: {
  vehicle: FinancingVehicle;
  whatsappNumber?: string;
}) {
  const [downPayment, setDownPayment] = useState("");
  const [term, setTerm] = useState("48");
  const started = useRef(false);
  const draft = { downPayment, term };
  const validation = validateFinancingDraft(draft, vehicle.price);
  const href = financingWhatsAppUrl(whatsappNumber, vehicle, draft);
  const error = validation.valid ? null : validation;
  const start = () => {
    if (!started.current) {
      started.current = true;
      trackEvent({ name: "financing_started", vehicleId: vehicle.id });
    }
  };
  return (
    <section
      id="financiamento"
      className="financing-panel"
      aria-labelledby="financing-title"
      data-contact-surface
    >
      <div className="financing-introduction">
        <p className="public-kicker">SEU PRÓXIMO PASSO</p>
        <h2 id="financing-title">Simule seu financiamento</h2>
        <p>
          Comece com suas preferências. O vendedor confirma as condições com
          você.
        </p>
        <div className="financing-value">
          <span>Valor do veículo</span>
          <strong>{money(vehicle.price)}</strong>
        </div>
      </div>
      <form
        className="financing-form"
        onSubmit={(event) => event.preventDefault()}
        onFocus={start}
        noValidate
      >
        <label htmlFor="financing-down-payment">
          Entrada pretendida (R$){" "}
          <span className="optional-label">opcional</span>
        </label>
        <input
          id="financing-down-payment"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Informe o valor de entrada"
          maxLength={16}
          value={downPayment}
          onChange={(event) => setDownPayment(event.target.value)}
          aria-invalid={error?.field === "downPayment"}
          aria-describedby={
            error?.field === "downPayment"
              ? "financing-error financing-entry-help"
              : "financing-entry-help"
          }
        />
        <p id="financing-entry-help" className="field-hint">
          Deixe em branco se preferir conversar sobre a entrada.
        </p>
        <fieldset className="financing-terms">
          <legend>Prazo desejado</legend>
          <div>
            {financingTerms.map((value) => (
              <label key={value} className="term-choice">
                <input
                  type="radio"
                  name="financing-term"
                  value={value}
                  checked={term === String(value)}
                  onChange={(event) => setTerm(event.target.value)}
                />
                <span>
                  {value}x<span className="sr-only"> — {value} meses</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p id="financing-error" className="field-error" role="alert">
            {error.message}
          </p>
        )}
        <div className="financing-explanation">
          <p>
            Informe seus dados de financiamento com um vendedor para receber uma
            simulação personalizada.
          </p>
          <small>
            As parcelas e as condições serão informadas pelo vendedor. Nenhum
            valor de parcela é calculado aqui.
          </small>
        </div>
        {href ? (
          <ContactLink
            href={href}
            className="button button-dark"
            source="financing"
            vehicleId={vehicle.id}
            onClick={start}
          >
            Quero simular financiamento <span aria-hidden="true">↗</span>
          </ContactLink>
        ) : (
          <>
            <button type="button" className="button button-dark" disabled>
              Quero simular financiamento
            </button>
            {validation.valid && (
              <p className="contact-unavailable">
                O atendimento por WhatsApp ainda não está disponível.
              </p>
            )}
          </>
        )}
        <p className="financing-privacy">
          Ao abrir o WhatsApp, você poderá revisar a mensagem antes de enviá-la.
          Suas preferências não são salvas neste site.
        </p>
      </form>
    </section>
  );
}
