import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Gallery } from "../src/components/gallery";
import { galleryIndex, nextGalleryImage } from "../src/lib/gallery";

// Paths exercise isolated component rendering; no files, requests or uploads are created.
const images = ["/unit-a.webp", "/unit-b.webp", "/unit-c.webp"];

test("gallery selection follows the same photo across reorder and falls back after removal", () => {
  assert.equal(galleryIndex(images, images[2]), 2);
  assert.equal(galleryIndex([images[2], images[0]], images[2]), 0);
  assert.equal(galleryIndex([images[0]], images[2]), 0);
  assert.equal(galleryIndex([], images[2]), 0);
});
test("gallery wraps between last and first photo in both directions", () => {
  assert.equal(nextGalleryImage(images, images[2], 1), images[0]);
  assert.equal(nextGalleryImage(images, images[0], -1), images[2]);
  assert.equal(nextGalleryImage(images, images[1], 1), images[2]);
  assert.equal(nextGalleryImage(images, images[1], -1), images[0]);
});
test("gallery navigation tolerates zero, one and a removed selected photo", () => {
  assert.equal(nextGalleryImage([], undefined, 1), undefined);
  assert.equal(nextGalleryImage([images[0]], images[0], -1), images[0]);
  assert.equal(nextGalleryImage([images[0]], images[0], 1), images[0]);
  assert.equal(nextGalleryImage(images.slice(0, 2), images[2], 1), images[1]);
});
test("one-photo gallery has useful alt text and no redundant navigation controls", () => {
  const html = renderToStaticMarkup(
    createElement(Gallery, {
      images: images.slice(0, 1),
      title: "unit-image-title",
    }),
  );
  assert.match(html, /alt="unit-image-title — foto 1"/);
  assert.doesNotMatch(html, /<button/);
  assert.match(html, /\/_next\/image/);
});
test("multiple-photo gallery exposes keyboard entry, labelled controls and selected thumbnail", () => {
  const html = renderToStaticMarkup(
    createElement(Gallery, { images, title: "unit-image-title" }),
  );
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-label="Foto anterior"/);
  assert.match(html, /aria-label="Próxima foto"/);
  assert.equal((html.match(/aria-label="Ver foto /g) || []).length, 3);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
});
