import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Expand } from 'lucide-react';
import { wedding } from '../config/wedding.js';
import { asset } from '../utils/links.js';
import SectionHeading from '../components/SectionHeading.jsx';
import Reveal from '../components/Reveal.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { Mandala } from '../components/Ornament.jsx';
import '../styles/gallery.css';

const COMING_SOON = 'Photo coming soon';
const pad = (n) => String(n).padStart(2, '0');
const sum = (list) => list.reduce((total, value) => total + value, 0);

/*
 * ───────── Editorial grid ─────────
 * A grid row is a quarter of a column wide, so a tile spanning
 *   3 rows = 4:3 landscape · 4 rows = square · 5 rows = 4:5 portrait · 6 rows = 2:3 portrait.
 * Tiles are stacked in columns, and the stacks of one band always add up to the
 * same number of rows — so the grid ends in a clean edge for ANY number of photos.
 * STACKS[columns][tiles per column] → the row spans of each column, top to bottom.
 */
const STACKS = {
  2: {
    1: [[5], [5]],
    2: [[3, 6], [6, 3]],
    3: [[3, 6, 4], [6, 4, 3]],
  },
  3: {
    1: [[5], [5], [5]],
    2: [[3, 6], [4, 5], [6, 3]],
    3: [[3, 6, 4], [6, 4, 3], [4, 3, 6]],
  },
};

/** Returns one CSS `grid-area` value per photo, in reading order. */
function buildLayout(count, cols) {
  if (count < 1) return [];
  if (count === 1) return ['1 / 1 / span 5 / span 1']; // a single portrait (the grid narrows itself)

  const areas = [];
  const place = (col, row, colSpan, rowSpan) =>
    areas.push(`${row} / ${col} / span ${rowSpan} / span ${colSpan}`);
  let row = 1;
  let left = count;

  // 1 · An opening "feature" band takes the photos that would not fill whole columns.
  const spare = count % cols;
  if (cols === 2 && spare === 1) {
    place(1, row, 2, 6); // full-width feature
    row += 6;
    left -= 1;
  } else if (cols === 3 && spare === 1) {
    place(1, row, 2, 9); // large feature …
    [0, 3, 6].forEach((offset) => place(3, row + offset, 1, 3)); // … beside three landscapes
    row += 9;
    left -= 4;
  } else if (cols === 3 && spare === 2) {
    place(1, row, 2, 6); // wide landscape …
    place(3, row, 1, 6); // … beside a portrait
    row += 6;
    left -= 2;
  }

  // 2 · Everything else: the same number of tiles in every column, in bands of two (or three).
  let perColumn = left / cols;
  const bands = [];
  if (perColumn === 1) bands.push(1);
  else {
    while (perColumn >= 4 || perColumn === 2) {
      bands.push(2);
      perColumn -= 2;
    }
    if (perColumn === 3) bands.push(3);
  }
  bands.forEach((size, b) => {
    const stacks = STACKS[cols][size];
    const columns = b % 2 ? [...stacks].reverse() : stacks; // mirror every other band
    for (let i = 0; i < size; i += 1) {
      columns.forEach((stack, c) => place(c + 1, row + sum(stack.slice(0, i)), 1, stack[i]));
    }
    row += sum(columns[0]);
  });
  return areas;
}

/** A photo that fades in over the ornamental tile once it has loaded. */
function TileImage({ src, alt, onError }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <img
      ref={ref}
      className={`gallery__img${loaded ? ' gallery__img--loaded' : ''}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={onError}
    />
  );
}

export default function Gallery() {
  const items = wedding.gallery || [];
  const total = items.length;
  const [active, setActive] = useState(null); // index shown in the lightbox, or null
  const [failed, setFailed] = useState({}); // index → true when a photo could not be loaded
  const openerRef = useRef(null);

  const layout = useMemo(
    () => ({ phone: buildLayout(total, 2), wide: buildLayout(total, 3) }),
    [total]
  );

  // What each tile (and the lightbox) shows: a real photo, or an ornamental placeholder.
  const slides = useMemo(
    () =>
      items.map((item, i) => {
        const hasPhoto = Boolean(item.src) && !failed[i];
        return {
          src: hasPhoto ? asset(item.src) : '',
          alt: item.alt || '',
          caption: hasPhoto ? item.caption || '' : (!item.src && item.caption) || COMING_SOON,
        };
      }),
    [items, failed]
  );
  const photoCount = slides.filter((slide) => slide.src).length;

  const markFailed = useCallback(
    (i) => setFailed((prev) => (prev[i] ? prev : { ...prev, [i]: true })),
    []
  );
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="gallery" className="section section--cream gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading id="gallery-title" eyebrow="Cherished Moments" title="Photo Gallery" />
        <Reveal as="p" className="lead gallery__intro" delay={100}>
          {photoCount > 0
            ? 'A few moments we will treasure forever.'
            : 'Our favourite moments will be shared here soon.'}
        </Reveal>

        {total > 0 ? (
          <ul className={`gallery__grid${total === 1 ? ' gallery__grid--solo' : ''}`} role="list">
            {slides.map((slide, i) => {
              const hasPhoto = Boolean(slide.src);
              const describe = hasPhoto ? slide.alt || slide.caption || 'photograph' : slide.caption;
              return (
                <Reveal
                  as="li"
                  key={i}
                  variant="zoom"
                  delay={(i % 6) * 70}
                  className="gallery__item"
                  style={{ '--gallery-phone': layout.phone[i], '--gallery-wide': layout.wide[i] }}
                >
                  <button
                    type="button"
                    className={`gallery__tile frame gallery__tile--${hasPhoto ? 'photo' : 'empty'}`}
                    aria-haspopup="dialog"
                    aria-label={`View photo ${i + 1} of ${total}: ${describe}`}
                    onClick={(event) => {
                      openerRef.current = event.currentTarget;
                      setActive(i);
                    }}
                  >
                    <span className="gallery__media">
                      <span className="gallery__art" aria-hidden="true">
                        <Mandala className="gallery__mandala" size={200} />
                      </span>
                      {hasPhoto ? (
                        <TileImage src={slide.src} alt={slide.alt} onError={() => markFailed(i)} />
                      ) : (
                        <>
                          <span className="gallery__number" aria-hidden="true">{pad(i + 1)}</span>
                          <span className="gallery__note">{slide.caption}</span>
                        </>
                      )}
                    </span>
                    {hasPhoto && slide.caption && <span className="gallery__caption">{slide.caption}</span>}
                    <span className="gallery__zoom" aria-hidden="true">
                      <Expand size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <Reveal className="gallery__empty frame" variant="zoom">
            <Mandala className="gallery__empty-art" size={120} />
            <p className="gallery__empty-text">Photographs will be added here soon.</p>
          </Reveal>
        )}
      </div>

      {active !== null && slides[active] && (
        <Lightbox
          items={slides}
          index={active}
          onIndexChange={setActive}
          onClose={close}
          onImageError={markFailed}
          returnFocusRef={openerRef}
          label="Photo gallery viewer"
        />
      )}
    </section>
  );
}
