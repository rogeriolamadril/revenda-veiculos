import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateFinancingDraft,
  financingWhatsAppUrl,
  type FinancingVehicle,
} from "../src/lib/financing";
import {
  createAnalyticsTracker,
  type AnalyticsEvent,
} from "../src/lib/analytics";
import { parseFilters } from "../src/lib/validation";
import { whatsappUrl } from "../src/lib/format";

// Technical input for pure unit functions only. Never persisted or used by the application.
const input: FinancingVehicle = {
  id: "unit-input",
  brand: "A&B",
  model: "M/1",
  version: null,
  year: 2000,
  price: 100,
};
const phoneInput = "+1 (202) 555-0100";

test("interest CTA preserves vehicle and price without adding financing preferences", () => {
  const href = whatsappUrl(phoneInput, input);
  assert.ok(href);
  const message = new URL(href).searchParams
    .get("text")!
    .replaceAll("\u00a0", " ");
  assert.match(message, /Tenho interesse no A&B M\/1 2000/);
  assert.match(message, /R\$ 100,00/);
  assert.doesNotMatch(message, /Entrada pretendida|Prazo desejado/);
});

test("an omitted down payment remains distinct from an explicit zero", () => {
  assert.deepEqual(
    validateFinancingDraft({ downPayment: " ", term: "24" }, 100),
    { valid: true, preferences: { downPayment: undefined, term: 24 } },
  );
  assert.deepEqual(
    validateFinancingDraft({ downPayment: "0", term: "60" }, 100),
    { valid: true, preferences: { downPayment: 0, term: 60 } },
  );
  assert.deepEqual(
    validateFinancingDraft({ downPayment: "12,34", term: "36" }, 100),
    { valid: true, preferences: { downPayment: 12.34, term: 36 } },
  );
});
test("invalid, negative, overly precise or excessive entries cannot become contact links", () => {
  for (const downPayment of [
    "-1",
    "1e2",
    "NaN",
    "Infinity",
    "100.01",
    "1.234",
    "1,2,3",
    "R$ 10",
    "9".repeat(400),
  ]) {
    assert.equal(
      validateFinancingDraft({ downPayment, term: "48" }, 100).valid,
      false,
      downPayment,
    );
    assert.equal(
      financingWhatsAppUrl(phoneInput, input, { downPayment, term: "48" }),
      null,
    );
  }
  assert.equal(
    validateFinancingDraft({ downPayment: "100", term: "48" }, 100).valid,
    true,
  );
  for (const term of ["", "12", "72", "48.0", "048", "48 months"])
    assert.equal(
      validateFinancingDraft({ downPayment: "", term }, 100).valid,
      false,
    );
  for (const price of [NaN, Infinity, -1, 10000000000])
    assert.equal(
      validateFinancingDraft({ downPayment: "", term: "48" }, price).valid,
      false,
    );
});
test("WhatsApp draft encodes the selected vehicle, price, optional entry and desired term", () => {
  const url = financingWhatsAppUrl(phoneInput, input, {
    downPayment: "12,34",
    term: "36",
  });
  assert.ok(url);
  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://wa.me");
  assert.equal(parsed.pathname, "/12025550100");
  const message = parsed.searchParams.get("text")!.replaceAll("\u00a0", " ");
  assert.match(message, /A&B M\/1 2000/);
  assert.match(message, /R\$ 100,00/);
  assert.match(message, /Entrada pretendida: R\$ 12,34/);
  assert.match(message, /36 meses/);
  assert.doesNotMatch(message, /CPF|taxa|parcela de/);
  const omitted = new URL(
    financingWhatsAppUrl(phoneInput, input, { downPayment: "", term: "60" })!,
  );
  assert.doesNotMatch(omitted.searchParams.get("text")!, /Entrada pretendida/);
  assert.equal(
    financingWhatsAppUrl(undefined, input, { downPayment: "", term: "48" }),
    null,
  );
  assert.equal(
    financingWhatsAppUrl("javascript:alert(1)", input, {
      downPayment: "",
      term: "48",
    }),
    null,
  );
});
test("analytics has no default destination; adapter errors do not block contact", () => {
  const events: AnalyticsEvent[] = [];
  const click: AnalyticsEvent = {
    name: "whatsapp_clicked",
    source: "financing",
    vehicleId: "unit-input",
  };
  assert.equal(createAnalyticsTracker()(click), undefined);
  createAnalyticsTracker((event) => events.push(event))(click);
  assert.deepEqual(events, [click]);
  assert.doesNotThrow(() =>
    createAnalyticsTracker(() => {
      throw new Error("adapter unavailable");
    })(click),
  );
});
test("maximum mileage preserves zero and discards malformed URL values", () => {
  assert.equal(parseFilters({ maxMileage: "0" }).maxMileage, 0);
  assert.equal(
    parseFilters({ maxMileage: "2147483647" }).maxMileage,
    2147483647,
  );
  for (const maxMileage of ["-1", "1.5", "2147483648", "NaN", "1e5", ""])
    assert.equal(parseFilters({ maxMileage }).maxMileage, undefined);
  assert.equal(parseFilters({ maxMileage: ["1", "2"] }).maxMileage, undefined);
});
