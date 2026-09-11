"use client";
import Image from "next/image";
import { useState } from "react";
import { galleryIndex, nextGalleryImage } from "@/lib/gallery";
import { NoPhoto } from "./ui";

export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selected, setSelected] = useState<string>();
  const index = galleryIndex(images, selected);
  const [failed, setFailed] = useState<string[]>([]);
  const [failedThumbnails, setFailedThumbnails] = useState<string[]>([]);
  if (!images.length)
    return (
      <div className="gallery-main">
        <NoPhoto />
      </div>
    );
  const move = (delta: -1 | 1) =>
    setSelected((current) => nextGalleryImage(images, current, delta));
  return (
    <section
      className="gallery"
      aria-label="Fotos do veículo"
      aria-roledescription="carrossel"
      tabIndex={images.length > 1 ? 0 : undefined}
      aria-keyshortcuts={images.length > 1 ? "ArrowLeft ArrowRight" : undefined}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          move(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="gallery-main">
        {failed.includes(images[index]) ? (
          <div className="no-photo">Não foi possível carregar esta foto.</div>
        ) : (
          <Image
            src={images[index]}
            alt={`${title} — foto ${index + 1}`}
            fill
            sizes="(max-width: 900px) 100vw, 65vw"
            priority
            onError={() => setFailed((f) => [...f, images[index]])}
          />
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-prev"
              aria-label="Foto anterior"
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="gallery-next"
              aria-label="Próxima foto"
              onClick={() => move(1)}
            >
              →
            </button>
          </>
        )}
        <span className="gallery-counter" aria-live="polite">
          {index + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setSelected(src)}
            >
              {failedThumbnails.includes(src) ? (
                <span className="gallery-thumbnail-error">
                  Foto indisponível
                </span>
              ) : (
                <Image
                  src={src}
                  alt=""
                  width={100}
                  height={72}
                  onError={() =>
                    setFailedThumbnails((current) =>
                      current.includes(src) ? current : [...current, src],
                    )
                  }
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
