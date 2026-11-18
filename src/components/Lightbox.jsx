import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Corner, Mandala } from './Ornament.jsx';
import { Lotus } from './Florals.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import '../styles/lightbox.css';

const CLOSE_MS = 200; // keep in sync with the closing animation in lightbox.css
const SWIPE_DISTANCE = 56; // px a finger must travel to turn the page …
const FLICK_DISTANCE = 24; // … or this far when it is a quick flick
const FLICK_SPEED = 0.5; // px per ms
const KEEP_OPEN = 'button, .lightbox__media, .lightbox__caption'; // a click anywhere else closes
const pad = (n) => String(n).padStart(2, '0');

/** One photo — or, while there is no photo yet, an enlarged ornamental placeholder. */
function Slide({ item, index, enter, onImageError }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(item.src) && !broken;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <figure className={`lightbox__figure lightbox__figure--${enter}`}>
      {showPhoto ? (
        <div className={`lightbox__media${loaded ? '' : ' lightbox__media--loading'}`}>
          {!loaded && (
            <span className="lightbox__loader" aria-hidden="true">
              <Mandala size={72} color="var(--gold-light)" strokeWidth={1.4} />
            </span>
          )}
          <img
            ref={imgRef}
            className="lightbox__img"
            src={item.src}
            alt={item.alt}
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setBroken(true);
              onImageError?.(index);
            }}
          />
        </div>
      ) : (
        <div className="lightbox__media lightbox__placeholder frame" aria-hidden="true">
          <Corner corner="tl" size={54} className="lightbox__corner lightbox__corner--tl" />
          <Corner corner="tr" size={54} className="lightbox__corner lightbox__corner--tr" />
          <Corner corner="bl" size={54} className="lightbox__corner lightbox__corner--bl" />
          <Corner corner="br" size={54} className="lightbox__corner lightbox__corner--br" />
          <span className="lightbox__art">
            <Mandala className="lightbox__mandala" size={200} />
          </span>
          <span className="lightbox__number">{pad(index + 1)}</span>
          <Lotus className="lightbox__lotus lightbox__lotus--top" size={56} color="var(--gold-deep)" strokeWidth={1.2} />
          <Lotus className="lightbox__lotus lightbox__lotus--bottom" size={56} color="var(--gold-deep)" strokeWidth={1.2} />
        </div>
      )}
      {item.caption && <figcaption className="lightbox__caption">{item.caption}</figcaption>}
    </figure>
  );
}

/**
 * Full-screen photo viewer, rendered in a portal on <body>.
 *   items          [{ src, alt, caption }] — an empty `src` shows the ornamental placeholder
 *   index          the photo being shown
 *   onIndexChange  (index) => void
 *   onClose        () => void — the parent unmounts the lightbox
 *   onImageError   (index) => void — optional, a photo failed to load
 *   returnFocusRef ref to the element that receives focus again on close
 * Keyboard: Esc closes · ← → (Home / End) navigate · Tab stays inside. Touch: swipe sideways.
 * The browser's Back also closes it.
 */
export default function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
  onImageError,
  returnFocusRef,
  label = 'Photo viewer',
}) {
  const reduced = useReducedMotion();
  const statusId = useId();
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const stageRef = useRef(null);
  const closingRef = useRef(false);
  const closeTimer = useRef(0);
  const [closing, setClosing] = useState(false);
  const [enter, setEnter] = useState('open'); // which way the current photo came in: open | next | prev

  const total = items.length;
  const item = items[index] || items[0];
  const many = total > 1;

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (reduced) {
      onClose();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, CLOSE_MS);
  };

  const goTo = (next, way) => {
    if (!many || closingRef.current) return;
    const target = ((next % total) + total) % total;
    if (target === index) return;
    setEnter(way);
    onIndexChange(target);
  };
  const step = (delta) => goTo(index + delta, delta > 0 ? 'next' : 'prev');

  // The listeners below are attached once; they read the latest handlers from here.
  const live = useRef({});
  live.current = { requestClose, step, goTo, index, total, many, reduced, returnFocusRef };

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return undefined;
    const opener = document.activeElement;

    /* — lock the page behind (and keep it from jumping when the scrollbar goes) — */
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--lightbox-scrollbar', `${Math.max(0, scrollbar)}px`);
    document.body.classList.add('lightbox-open');

    (closeRef.current || root).focus({ preventScroll: true });

    /* — everything else on the page is switched off: no focus, no clicks, hidden from screen readers
         (`inert`, plus aria-hidden for browsers that do not know `inert` yet) — */
    const silenced = [];
    Array.from(document.body.children).forEach((el) => {
      if (el === root) return;
      silenced.push({ el, inert: el.hasAttribute('inert'), hidden: el.getAttribute('aria-hidden') });
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    });

    /* — "Back" (Android's button, a browser swipe) closes the viewer instead of leaving the invitation — */
    let ownsHistoryEntry = false;
    const historyTimer = window.setTimeout(() => {
      try {
        window.history.pushState({ lightbox: true }, '');
        ownsHistoryEntry = true;
      } catch {
        /* no history access (e.g. a sandboxed frame): everything else still works */
      }
    }, 0);
    const onPopState = () => {
      if (!ownsHistoryEntry) return;
      ownsHistoryEntry = false; // that entry is already gone
      live.current.requestClose();
    };

    /* — keyboard — */
    const onKeyDown = (event) => {
      const now = live.current;
      if (event.key === 'Tab') {
        // keep Tab inside the dialog (for browsers without `inert`)
        const stops = Array.from(root.querySelectorAll('button:not([disabled])'));
        if (!stops.length) {
          event.preventDefault();
          root.focus({ preventScroll: true });
          return;
        }
        const first = stops[0];
        const last = stops[stops.length - 1];
        const current = document.activeElement;
        const inside = root.contains(current) && current !== root;
        if (event.shiftKey && (!inside || current === first)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (!inside || current === last)) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      switch (event.key) {
        case 'Escape':
        case 'Esc':
          event.preventDefault();
          now.requestClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          now.step(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          now.step(1);
          break;
        case 'Home':
          event.preventDefault();
          now.goTo(0, 'prev');
          break;
        case 'End':
          event.preventDefault();
          now.goTo(now.total - 1, 'next');
          break;
        default:
      }
    };
    const onFocusIn = (event) => {
      if (!root.contains(event.target)) (closeRef.current || root).focus({ preventScroll: true });
    };

    /* — pinch-zoom stays available; while zoomed in, one finger pans the photo instead of turning the page — */
    const viewport = window.visualViewport;
    const isZoomed = () => Boolean(viewport) && viewport.scale > 1.02;
    const onViewportResize = () => root.classList.toggle('lightbox--zoomed', isZoomed());
    onViewportResize();

    /* — touch: a sideways swipe turns the page, and the photo follows the finger — */
    let touch = null;
    const follow = (dx, animate) => {
      stage.style.transition = animate ? '' : 'none';
      stage.style.transform = dx ? `translate3d(${dx}px, 0, 0)` : '';
    };
    const onTouchStart = (event) => {
      if (event.touches.length !== 1 || isZoomed()) {
        touch = null; // pinching or panning a zoomed photo: leave it to the browser
        follow(0, true);
        return;
      }
      const point = event.touches[0];
      touch = { x: point.clientX, y: point.clientY, at: Date.now(), axis: '', dx: 0 };
    };
    const onTouchMove = (event) => {
      if (!touch) return;
      if (event.touches.length !== 1) {
        touch = null;
        follow(0, true);
        return;
      }
      const point = event.touches[0];
      const dx = point.clientX - touch.x;
      const dy = point.clientY - touch.y;
      if (!touch.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        touch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (event.cancelable) event.preventDefault(); // the page behind must not scroll (older iOS)
      if (touch.axis !== 'x') return;
      touch.dx = dx;
      const now = live.current;
      if (now.many && !now.reduced) follow(dx, false);
    };
    const onTouchEnd = () => {
      if (!touch) return;
      const { axis, dx, at } = touch;
      touch = null;
      const now = live.current;
      const distance = Math.abs(dx);
      const flick = distance / Math.max(1, Date.now() - at) > FLICK_SPEED;
      const turn = axis === 'x' && now.many && (distance > SWIPE_DISTANCE || (flick && distance > FLICK_DISTANCE));
      follow(0, !turn); // snap back smoothly, or let the next photo slide in
      if (turn) now.step(dx < 0 ? 1 : -1);
    };
    const onTouchCancel = () => {
      touch = null;
      follow(0, true);
    };

    window.addEventListener('popstate', onPopState);
    viewport?.addEventListener('resize', onViewportResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd);
    root.addEventListener('touchcancel', onTouchCancel);

    return () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(historyTimer);
      window.removeEventListener('popstate', onPopState);
      viewport?.removeEventListener('resize', onViewportResize);
      if (ownsHistoryEntry) window.history.back(); // closed from inside: drop the entry we added
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchCancel);
      silenced.forEach(({ el, inert, hidden }) => {
        if (!inert) el.removeAttribute('inert');
        if (hidden === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', hidden);
      });
      document.body.classList.remove('lightbox-open');
      document.documentElement.style.removeProperty('--lightbox-scrollbar');
      // hand focus back to the tile that opened the viewer
      const target = live.current.returnFocusRef?.current || opener;
      if (target && typeof target.focus === 'function' && document.contains(target)) {
        target.focus({ preventScroll: true });
      }
    };
  }, []);

  // Warm up the neighbouring photos so paging feels instant.
  useEffect(() => {
    if (!many || navigator.connection?.saveData) return;
    [1, -1].forEach((delta) => {
      const neighbour = items[(index + delta + total) % total];
      if (neighbour?.src) new Image().src = neighbour.src;
    });
  }, [index, items, many, total]);

  if (!item) return null;

  const onBackdropClick = (event) => {
    if (event.target.closest?.(KEEP_OPEN)) return;
    requestClose();
  };
  const describe = item.src ? item.alt || item.caption : item.caption;

  return createPortal(
    <div
      ref={rootRef}
      className={`lightbox${closing ? ' lightbox--closing' : ''}${many ? '' : ' lightbox--single'}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-describedby={statusId}
      tabIndex={-1}
      onClick={onBackdropClick}
    >
      <p id={statusId} className="lightbox__counter" aria-live="polite" aria-atomic="true">
        <span className="sr-only">{`Photo ${index + 1} of ${total}${describe ? `: ${describe}` : ''}`}</span>
        <span aria-hidden="true">
          {index + 1}
          <span className="lightbox__counter-sep"> / </span>
          {total}
        </span>
      </p>

      <button
        ref={closeRef}
        type="button"
        className="lightbox__btn lightbox__close"
        aria-label="Close photo viewer"
        onClick={requestClose}
      >
        <X size={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
      </button>

      {many && (
        <button
          type="button"
          className="lightbox__btn lightbox__nav lightbox__nav--prev"
          aria-label="Previous photo"
          onClick={() => step(-1)}
        >
          <ChevronLeft size={26} strokeWidth={1.5} aria-hidden="true" focusable="false" />
        </button>
      )}

      <div ref={stageRef} className="lightbox__stage">
        <Slide key={index} item={item} index={index} enter={enter} onImageError={onImageError} />
      </div>

      {many && (
        <button
          type="button"
          className="lightbox__btn lightbox__nav lightbox__nav--next"
          aria-label="Next photo"
          onClick={() => step(1)}
        >
          <ChevronRight size={26} strokeWidth={1.5} aria-hidden="true" focusable="false" />
        </button>
      )}
    </div>,
    document.body
  );
}
