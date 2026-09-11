import sharp from "sharp";
import { MAX_IMAGE_SIZE, validateImage } from "./validation";

export async function normalizeImage(file: File) {
  const error = validateImage(file);
  if (error) throw new Error(error);
  const bytes = Buffer.from(await file.arrayBuffer());
  const decoder = sharp(bytes, {
    limitInputPixels: 20000000,
    failOn: "warning",
    animated: false,
  });
  const metadata = await decoder.metadata();
  if (
    !["jpeg", "png", "webp"].includes(metadata.format || "") ||
    (metadata.pages || 1) > 1
  )
    throw new Error(
      "Formato não permitido. Use uma foto JPEG, PNG ou WebP sem animação.",
    );
  // Decoding/re-encoding validates the content and removes metadata, including GPS.
  const normalized = await decoder
    .rotate()
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();
  if (normalized.length > MAX_IMAGE_SIZE)
    throw new Error("A imagem processada excedeu 5 MB. Escolha outra foto.");
  return normalized;
}
