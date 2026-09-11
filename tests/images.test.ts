import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { normalizeImage } from "../src/lib/images";

test("declared MIME cannot disguise a non-image upload", async () => {
  const file = new File(["<script>alert(1)</script>"], "payload.jpg", {
    type: "image/jpeg",
  });
  await assert.rejects(() => normalizeImage(file));
});
test("SVG disguised as JPEG is rejected by content inspection", async () => {
  const file = new File(
    ['<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'],
    "payload.jpg",
    { type: "image/jpeg" },
  );
  await assert.rejects(() => normalizeImage(file));
});
test("valid technical image is re-encoded to WebP without metadata", async () => {
  // In-memory pixel buffer to exercise the decoder. Never saved or uploaded as a vehicle photo.
  const bytes = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  const file = new File([new Uint8Array(bytes)], "pixel.png", {
    type: "image/png",
  });
  const normalized = await normalizeImage(file);
  const meta = await sharp(normalized).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 2);
  assert.equal(meta.exif, undefined);
});

test("large technical image preserves aspect ratio within the 1920px bound", async () => {
  // Memory-only decoder input; never a catalogue asset or Storage upload.
  const bytes = await sharp({
    create: { width: 2000, height: 1000, channels: 3, background: "#ffffff" },
  }).png().toBuffer();
  const normalized = await normalizeImage(
    new File([new Uint8Array(bytes)], "dimensions.png", { type: "image/png" }),
  );
  const meta = await sharp(normalized).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 1920);
  assert.equal(meta.height, 960);
});
test("compressed image below the byte limit still rejects more than 20 megapixels", async () => {
  const bytes = await sharp({
    create: { width: 5000, height: 4001, channels: 3, background: "#ffffff" },
  }).png().toBuffer();
  assert.ok(bytes.length < 5 * 1024 * 1024);
  const file = new File([new Uint8Array(bytes)], "pixel-limit.png", {
    type: "image/png",
  });
  await assert.rejects(() => normalizeImage(file), /pixel limit/i);
});
