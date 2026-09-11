import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CatalogFilters } from "../src/components/catalog-filters";
import { FinancingPanel } from "../src/components/financing-panel";
import { Gallery } from "../src/components/gallery";
import { EmptyState } from "../src/components/ui";
import { parseFilters } from "../src/lib/validation";

test("empty catalogue facets expose no invented brands, models or transmissions", () => {
  const html = renderToStaticMarkup(
    createElement(CatalogFilters, { filters: parseFilters({}), facets: [] }),
  );
  assert.equal((html.match(/<option /g) || []).length, 4);
  assert.doesNotMatch(html, /<details[^>]* open/);
  assert.match(html, /role="search"/);
  assert.match(html, /name="maxMileage"/);
});
test("active advanced filters remain visible and preserve zero", () => {
  const html = renderToStaticMarkup(
    createElement(CatalogFilters, {
      filters: parseFilters({ maxMileage: "0", min: "0", max: "10" }),
      facets: [],
    }),
  );
  assert.match(html, /<details[^>]* open=""/);
  assert.match(html, /name="maxMileage"[^>]*value="0"/);
  assert.match(html, /name="min"[^>]*value="0"/);
});
test("gallery without registered images shows an honest empty state", () => {
  const html = renderToStaticMarkup(
    createElement(Gallery, { images: [], title: "unit-input" }),
  );
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /Sem foto cadastrada/);
});
test("financing starts with an optional empty entry, four labelled terms and no collection of personal data", () => {
  // Minimal technical component input, not a vehicle record, never sent to any service.
  const vehicle = {
    id: "unit-input",
    brand: "A",
    model: "B",
    version: null,
    year: 2000,
    price: 100,
  };
  const html = renderToStaticMarkup(createElement(FinancingPanel, { vehicle }));
  assert.match(html, /Entrada pretendida/);
  assert.match(html, /id="financing-down-payment"[^>]*value=""/);
  assert.equal((html.match(/type="radio"/g) || []).length, 4);
  assert.match(html, /checked=""[^>]*value="48"/);
  assert.match(html, /<button[^>]*disabled/);
  assert.doesNotMatch(html, /wa\.me|CPF|type="file"|type="email"/);
  assert.match(
    html,
    /Informe seus dados de financiamento com um vendedor para receber uma simulação personalizada\./,
  );
});

test("empty stock renders an honest message and an accessible recovery action", () => {
  const html = renderToStaticMarkup(createElement(EmptyState, {
    title: "Nenhum veículo encontrado",
    children: "Tente ajustar os filtros.",
    action: createElement("a", { href: "/" }, "Limpar filtros"),
  }));
  assert.match(html, /<h2>Nenhum veículo encontrado<\/h2>/);
  assert.match(html, /Tente ajustar os filtros\./);
  assert.match(html, /<a href="\/">Limpar filtros<\/a>/);
  assert.match(html, /data-contact-surface="true"/);
  assert.doesNotMatch(html, /<img|R\$/);
});
test("configured financing contact encodes the vehicle and default term without inventing an entry", () => {
  // Reserved technical phone and component input, never used as business data.
  const html = renderToStaticMarkup(createElement(FinancingPanel, {
    vehicle: {
      id: "unit-input",
      brand: "A&B",
      model: "M/1",
      version: null,
      year: 2000,
      price: 100,
    },
    whatsappNumber: "+1 (202) 555-0100",
  }));
  const href = html.match(/href="(https:\/\/wa\.me\/[^"]+)"/)?.[1];
  assert.ok(href);
  const url = new URL(href.replaceAll("&amp;", "&"));
  assert.equal(url.pathname, "/12025550100");
  const message = url.searchParams.get("text");
  assert.ok(message);
  assert.match(message, /A&B M\/1 2000/);
  assert.match(message, /R\$\s100,00/);
  assert.match(message, /Prazo desejado: 48 meses/);
  assert.doesNotMatch(message, /Entrada pretendida/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /<button[^>]*disabled/);
});
