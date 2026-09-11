"use client";
import Image from "next/image";
import { useState } from "react";
import { NoPhoto } from "./ui";

export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  if (!images.length)
    return (
      <div className="gallery-main">
        <NoPhoto />
      </div>
    );
  const move = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);
  return (
    <section
      className="gallery"
      aria-label="Fotos do veículo"
      aria-roledescription="carrossel"
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
              onClick={() => setIndex(i)}
            >
              <Image src={src} alt="" width={100} height={72} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
