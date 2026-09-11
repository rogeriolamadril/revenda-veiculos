// Keep selection attached to a photo when the list changes after a refresh.
export function galleryIndex(images: readonly string[], selected?: string) {
  return Math.max(0, images.indexOf(selected ?? ""));
}

export function nextGalleryImage(
  images: readonly string[],
  selected: string | undefined,
  direction: -1 | 1,
) {
  if (!images.length) return undefined;
  const index = galleryIndex(images, selected);
  return images[(index + direction + images.length) % images.length];
}
