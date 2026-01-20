'use client';

import Image from 'next/image';
import { useState } from 'react';

type Img = { url: string };

export default function Gallery({
  images,
  alt,
}: {
  images: Img[];
  alt: string;
}) {
  const safe = images?.filter(Boolean) ?? [];
  const [active, setActive] = useState(0);

  if (!safe.length) return null;

  const main = safe[active]?.url ?? safe[0].url;

  return (
    <div className="gallery">
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: 16,
          border: '1px solid var(--line)',
          overflow: 'hidden',
          background: 'var(--panel)',
        }}
      >
        <Image
          src={main}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: 'contain', objectPosition: 'center', }}
          priority
        />
      </div>

      {safe.length > 1 && (
        <div className="thumb-row" role="listbox" aria-label="Autres images">
          {safe.slice(0, 6).map((img, i) => {
            const selected = i === active;
            return (
              <button
                type="button"
                key={i}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActive(i);
                }}
                aria-selected={selected}
                title={`Voir l’image ${i + 1}`}
                style={{
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  outlineOffset: 3,
                }}
              >
                <div
                  className="thumb"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    border:
                      selected ? '2px solid var(--brand-500)' : '1px solid var(--line)',
                  }}
                >
                  <Image
                    src={img.url}
                    alt={`miniature ${i + 1}`}
                    fill
                    sizes="72px"
                    style={{ objectFit: 'cover' }}
                    
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
