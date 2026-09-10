import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseFilters,
  vehicleSchema,
  validateImage,
  MAX_IMAGE_SIZE,
} from "../src/lib/validation";
import { whatsappUrl } from "../src/lib/format";

test("price requires nonnegative numeric input with at most two decimal places", () => {
  const schema = vehicleSchema.shape.price;
  for (const value of [
    "",
    "-1",
    "1e5",
    "1.234",
    "NaN",
    "R$ 1,00",
    "10000000000",
  ])
    assert.equal(schema.safeParse(value).success, false, value);
  assert.equal(schema.parse("0"), 0);
  assert.equal(schema.parse("12.34"), 12.34);
});
test("mileage must be an integer within PostgreSQL range", () => {
  for (const value of ["-1", "1.5", "2147483648", ""])
    assert.equal(vehicleSchema.shape.mileage.safeParse(value).success, false);
  assert.equal(vehicleSchema.shape.mileage.parse("0"), 0);
});
test("required text cannot be whitespace; missing optional information stays null", () => {
  assert.equal(vehicleSchema.shape.brand.safeParse("  ").success, false);
  assert.equal(vehicleSchema.shape.model.safeParse("").success, false);
  assert.equal(vehicleSchema.shape.version.parse("  "), null);
  assert.equal(vehicleSchema.shape.plate_final.safeParse("AB").success, false);
  assert.equal(vehicleSchema.shape.plate_final.parse("0"), "0");
});
test("options are normalized, deduplicated and bounded", () => {
  assert.deepEqual(vehicleSchema.shape.options.parse(" a\n a\n\nb "), [
    "a",
    "b",
  ]);
  assert.equal(
    vehicleSchema.shape.options.safeParse("x".repeat(101)).success,
    false,
  );
  assert.equal(
    vehicleSchema.shape.options.safeParse(
      Array.from({ length: 41 }, (_, i) => String(i)).join("\n"),
    ).success,
    false,
  );
});
test("unsupported status is rejected", () => {
  assert.equal(vehicleSchema.shape.status.safeParse("admin").success, false);
  assert.equal(
    vehicleSchema.shape.status.safeParse("disponivel").success,
    true,
  );
});
test("filters reject malformed numeric parameters and bound pagination", () => {
  const filters = parseFilters({
    page: "-2",
    year: "2020.5",
    min: "NaN",
    max: "Infinity",
    brand: ["injected", "values"],
  });
  assert.equal(filters.page, 1);
  assert.equal(filters.year, undefined);
  assert.equal(filters.min, undefined);
  assert.equal(filters.max, undefined);
  assert.equal(filters.brand, "");
  assert.equal(parseFilters({ min: "20", max: "10" }).invalidRange, true);
  assert.equal(parseFilters({ min: "0" }).min, 0);
});
test("upload validation rejects empty, oversized and arbitrary file formats", () => {
  assert.ok(validateImage({ size: 1, type: "image/svg+xml" }));
  assert.ok(validateImage({ size: 0, type: "image/jpeg" }));
  assert.ok(validateImage({ size: MAX_IMAGE_SIZE + 1, type: "image/png" }));
  assert.equal(
    validateImage({ size: MAX_IMAGE_SIZE, type: "image/webp" }),
    null,
  );
});
test("WhatsApp is absent without configuration and rejects URL injection", () => {
  for (const number of [
    undefined,
    "",
    "123",
    "javascript:alert(1)",
    "+55abc1234567890",
  ])
    assert.equal(whatsappUrl(number), null);
  // Structural phone input only; never used as a business contact or persisted record.
  const url = whatsappUrl("+1 (202) 555-0100");
  assert.ok(url);
  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://wa.me");
  assert.equal(parsed.pathname, "/12025550100");
  assert.ok(parsed.searchParams.get("text")?.includes("Olá!"));
});
