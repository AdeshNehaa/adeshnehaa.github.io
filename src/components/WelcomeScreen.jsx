import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { wedding, isPlaceholder } from '../config/wedding.js';
import ConfigText from './ConfigText.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { openGesture } from '../utils/openGesture.js';
import { Divider, Mandala } from './Ornament.jsx';
import { FallingPetals, FloralSpray, Garland, Lotus } from './Florals.jsx';
import '../styles/welcome.css';

/**
 * WelcomeScreen — the closed invitation that greets every guest.
 *
 *   loading  →  a gold mandala turns around the couple's monogram while the fonts arrive
 *   welcome  →  the closed card: blessing, names, date, venue and the seal that opens it
 *   opening  →  the card parts down the middle like a pair of doors, revealing the page
 *
 * `onOpen` is called exactly once, when the opening has finished.
 */

/* Timings in ms. welcome.css is written to match — change them together. */
const MIN_LOADING = 1200; // never flash the loader for less than this…
const MAX_LOADING = 3000; // …and never let a slow font hold the invitation back
const MONOGRAM_GRACE = 900; // after this the monogram shows in a fallback face
const LOADER_EXIT = 1000; // the loader cross-fades out, then leaves the DOM
const OPENING_FALLBACK = 2600; // safety net if `animationend` never arrives (CSS runs 1.6s)
const REDUCED_FALLBACK = 300; // reduced motion: a quick fade (CSS runs 220ms)
const MIN_SWAGS = 8; // garland swags drawn before the screen has been measured — plenty for a phone

/** First letter of a name (grapheme-aware, so it also works for Devanagari names). */
function initialOf(name) {
  const text = String(name ?? '').trim();
  if (!text) return '';
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const first = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)[Symbol.iterator]().next();
      if (!first.done) return first.value.segment.toLocaleUpperCase();
    }
  } catch {
    /* fall through to the simple version */
  }
  return Array.from(text)[0].toLocaleUpperCase();
}

/** "Saturday, 05 December 2026" → ['Saturday,', '05 December 2026'] so a narrow screen breaks the line at the comma. */
function dateParts(text) {
  const value = String(text ?? '').trim();
  const comma = value.indexOf(',');
  if (comma === -1) return [value, ''];
  return [value.slice(0, comma + 1).trim(), value.slice(comma + 1).trim()];
}

/**
 * How many garland swags to draw. The shared <Garland> draws 18 by default — a desktop's worth — but
 * a phone shows about six, and the card needs two garlands (one per door). So start small and measure:
 * the rendered SVG tells us how many of its swags fit across the screen. The count stays even so the
 * pattern never shifts when it changes, and if measuring is impossible the component's default is used.
 */
function useGarlandSwags(rootRef) {
  const [swags, setSwags] = useState(MIN_SWAGS);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const measure = () => {
      const svg = root.querySelector('.welcome__garland');
      const view = svg?.viewBox?.baseVal;
      const box = svg?.getBoundingClientRect();
      setSwags((current) => {
        if (!current || !view?.width || !view.height || !box?.width || !box.height) return undefined;
        const unitsAcross = (box.width / box.height) * view.height; // viewBox units the screen can show
        const needed = Math.ceil(unitsAcross / (view.width / current)) + 2;
        return Math.max(MIN_SWAGS, needed + (needed % 2));
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rootRef]);
  return swags;
}

const SEAL_SCALLOPS = Array.from({ length: 24 }, (_, i) => i * 15);

/** The gold seal: scalloped rim, beaded ring, embossed highlight and a lotus. `uid` keeps the gradient ids unique. */
function Seal({ uid }) {
  return (
    <>
      <SealArt uid={uid} />
      <Lotus className="welcome__seal-lotus" color="var(--maroon-deep)" strokeWidth={2.2} />
    </>
  );
}

function SealArt({ uid }) {
  return (
    <svg className="welcome__seal-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}-rim`} cx="0.36" cy="0.28" r="0.9">
          <stop offset="0" style={{ stopColor: 'var(--gold-light)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--gold)' }} />
          <stop offset="1" style={{ stopColor: 'var(--gold-deep)' }} />
        </radialGradient>
        <radialGradient id={`${uid}-face`} cx="0.38" cy="0.3" r="0.82">
          <stop offset="0" style={{ stopColor: 'var(--haldi-soft)' }} />
          <stop offset="0.42" style={{ stopColor: 'var(--gold-light)' }} />
          <stop offset="1" style={{ stopColor: 'var(--gold)' }} />
        </radialGradient>
      </defs>
      <g fill={`url(#${uid}-rim)`}>
        {SEAL_SCALLOPS.map((angle) => (
          <circle key={angle} cx="60" cy="8.6" r="7" transform={`rotate(${angle} 60 60)`} />
        ))}
        <circle cx="60" cy="60" r="52" />
      </g>
      <circle cx="60" cy="60" r="46.5" fill={`url(#${uid}-face)`} />
      <g fill="none">
        <circle cx="60" cy="60" r="46.5" stroke="var(--gold-deep)" strokeWidth="0.9" />
        <circle cx="60" cy="60" r="42" stroke="var(--maroon-deep)" strokeOpacity="0.38" strokeWidth="0.7" />
        <circle
          cx="60" cy="60" r="38.6" stroke="var(--gold-deep)" strokeOpacity="0.85" strokeWidth="1.3"
          strokeDasharray="0.1 3.36" strokeLinecap="round"
        />
        <path d="M24.5 46A38 38 0 0 1 70 23.4" stroke="var(--ivory)" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * One half of the closed card. Each door carries its own half of the decoration, so the artwork parts with it.
 * `seal` (set the moment the invitation is opened) puts a copy of the seal on the door exactly where the
 * button's seal sits; the door shows its half, so the seal breaks along the seam as the doors part.
 */
function Door({ side, swags, seal, onAnimationEnd }) {
  const corners = side === 'left' ? ['tl', 'bl'] : ['tr', 'br'];
  return (
    <div className={`welcome__door welcome__door--${side}`} onAnimationEnd={onAnimationEnd}>
      <div className="welcome__door-half">
        <div className="welcome__face">
          <span className="welcome__pattern section--pattern" />
          <span className="welcome__frame" />
          {corners.map((corner) => (
            <span key={corner} className={`welcome__spray welcome__spray--${corner}`}>
              <FloralSpray corner={corner} className="welcome__spray-art" />
            </span>
          ))}
          <Garland className="welcome__garland" swags={swags} />
          {seal && (
            <span
              className="welcome__door-seal"
              style={{ left: seal.left, top: seal.top, width: seal.size, height: seal.size }}
            >
              <Seal uid={`welcome-seal-${side}`} />
            </span>
          )}
        </div>
        <span className="welcome__door-shade" />
        <span className="welcome__door-edge" />
      </div>
    </div>
  );
}

export default function WelcomeScreen({ onOpen }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState('loading'); // 'loading' | 'welcome' | 'opening'
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [monogramReady, setMonogramReady] = useState(false);
  const [sealBox, setSealBox] = useState(null); // where the seal sits when the invitation is opened

  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const sealRef = useRef(null);
  const stageRef = useRef('loading'); // mirrors `stage` so handlers can guard synchronously
  const swags = useGarlandSwags(rootRef);
  const finishedRef = useRef(false);
  const onOpenRef = useRef(onOpen);
  useEffect(() => { onOpenRef.current = onOpen; }); // App passes a new function on every render

  const { couple, venue, messages } = wedding;
  const groomName = couple.groom.name;
  const brideName = couple.bride.name;
  const event = wedding.events.find((e) => e.id === 'wedding') ?? wedding.events[wedding.events.length - 1];
  const dateText = event?.displayDate;
  const [dateStart, dateRest] = dateParts(dateText);
  const openLabel = messages.openButton || 'Open Invitation';
  const isLoading = stage === 'loading';

  /** Hands the page over to App — once, however many signals ask for it. */
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onOpenRef.current?.();
  }, []);

  /* ── Stage 1 → 2: wait for the fonts (min 1.2s, max 3s) ── */
  useEffect(() => {
    let alive = true;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const advance = () => {
      if (!alive || stageRef.current !== 'loading') return;
      stageRef.current = 'welcome';
      setStage('welcome');
    };
    const showMonogram = () => { if (alive) setMonogramReady(true); };

    // The dialog takes focus straight away so the keyboard never reaches the page beneath.
    rootRef.current?.focus({ preventScroll: true });

    // Ask for exactly the faces this screen draws its own text with…
    const fonts = document.fonts;
    const requests = [];
    let monogramFont = null;
    if (fonts && typeof fonts.load === 'function') {
      rootRef.current?.querySelectorAll('[data-welcome-font]').forEach((el) => {
        try {
          const style = getComputedStyle(el);
          const request = fonts
            .load(`${style.fontStyle} ${style.fontWeight} 16px ${style.fontFamily}`, el.textContent || 'A')
            .catch(() => []);
          requests.push(request);
          if (el.dataset.welcomeFont === 'monogram') monogramFont = request;
        } catch {
          /* an unparsable font shorthand is not worth holding the invitation for */
        }
      });
    }
    if (monogramFont) monogramFont.then(showMonogram);
    else showMonogram();
    later(showMonogram, MONOGRAM_GRACE);

    // …and, one beat later (so the page's own requests have started), for everything else.
    const everything = new Promise((resolve) => {
      later(() => {
        const ready = fonts && fonts.ready ? Promise.resolve(fonts.ready).catch(() => {}) : Promise.resolve();
        Promise.all([ready, ...requests]).then(resolve, resolve);
      }, 80);
    });
    const minimum = new Promise((resolve) => { later(resolve, MIN_LOADING); });
    Promise.all([everything, minimum]).then(advance);
    later(advance, MAX_LOADING);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  /* ── Modal: focus never rests outside the dialog (e.g. on the skip link above it) ── */
  useEffect(() => {
    const onFocusIn = (e) => {
      const root = rootRef.current;
      if (!root || root.contains(e.target)) return;
      (stageRef.current === 'welcome' ? buttonRef.current : root)?.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  /* ── Stage 2: the seal takes focus; the loader leaves once it has faded ── */
  useEffect(() => {
    if (stage === 'welcome') buttonRef.current?.focus({ preventScroll: true });
  }, [stage]);

  useEffect(() => {
    if (isLoading) return undefined;
    const id = setTimeout(() => setLoaderMounted(false), LOADER_EXIT);
    return () => clearTimeout(id);
  }, [isLoading]);

  /* ── Stage 3: open. `animationend` / `transitionend` finish it; this timer guarantees it ── */
  useEffect(() => {
    if (stage !== 'opening') return undefined;
    const id = setTimeout(finish, reduced ? REDUCED_FALLBACK : OPENING_FALLBACK);
    return () => clearTimeout(id);
  }, [stage, reduced, finish]);

  const handleOpen = useCallback(() => {
    if (stageRef.current !== 'welcome') return; // ignores double clicks and clicks while loading
    stageRef.current = 'opening';
    openGesture.fire(); // lets the music begin inside this tap, when auto-start is switched on
    // Hand the seal over to the doors (one read of its position) so it can break along the seam —
    // unless motion is reduced, or the seal is still fading in and a sudden twin would pop.
    const button = buttonRef.current;
    const seal = sealRef.current?.getBoundingClientRect();
    const root = rootRef.current?.getBoundingClientRect();
    const settled = button ? Number(getComputedStyle(button).opacity) > 0.95 : false;
    if (!reduced && settled && seal && root && seal.width > 0) {
      setSealBox({ left: seal.left - root.left, top: seal.top - root.top, size: seal.width });
    }
    setStage('opening');
  }, [reduced]);

  // Full motion: the doors' swing is the last thing to end.
  const handleDoorEnd = useCallback((e) => {
    if (e.target === e.currentTarget && stageRef.current === 'opening') finish();
  }, [finish]);

  // Reduced motion: the whole card simply fades.
  const handleRootTransitionEnd = useCallback((e) => {
    if (e.target === e.currentTarget && e.propertyName === 'opacity' && stageRef.current === 'opening') finish();
  }, [finish]);

  // Modal: there is one control, so Tab stays on it.
  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    if (stageRef.current === 'welcome') buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={rootRef}
      className={`welcome welcome--${stage}${sealBox ? ' welcome--split' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${groomName} & ${brideName} — wedding invitation`}
      aria-busy={isLoading || undefined}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleRootTransitionEnd}
    >
      {/* Behind the doors: warm light spills through as they part */}
      <div className="welcome__glow" aria-hidden="true" />

      <div className="welcome__doors" aria-hidden="true">
        <Door side="left" swags={swags} seal={sealBox} />
        <Door side="right" swags={swags} seal={sealBox} onAnimationEnd={handleDoorEnd} />
      </div>

      {!isLoading && (
        <div className="welcome__ambient" aria-hidden="true">
          <FallingPetals count={10} />
        </div>
      )}

      <div className="welcome__content">
        <div className="welcome__inner">
          {messages.welcomeBlessing && (
            <p className="welcome__blessing welcome__item deva" lang="sa" data-welcome-font="" style={{ '--welcome-i': 0 }}>
              {messages.welcomeBlessing}
            </p>
          )}

          {messages.welcomeLine && (
            <p className="welcome__line welcome__item" data-welcome-font="" style={{ '--welcome-i': 1 }}>
              <ConfigText value={messages.welcomeLine} />
            </p>
          )}

          <div className="welcome__names-wrap">
            <div className="welcome__watermark" aria-hidden="true">
              <Mandala className="welcome__watermark-art" size={640} strokeWidth={0.5} />
            </div>
            <h1 className="welcome__names" data-welcome-font="">
              <span className="welcome__name welcome__item" style={{ '--welcome-i': 2 }}>{groomName}</span>{' '}
              <span className="welcome__amp welcome__item" style={{ '--welcome-i': 3 }}>&amp;</span>{' '}
              <span className="welcome__name welcome__item" style={{ '--welcome-i': 4 }}>{brideName}</span>
            </h1>
          </div>

          <div className="welcome__details welcome__item" style={{ '--welcome-i': 5 }}>
            <Divider className="welcome__divider" />
            {dateText && (
              <p className="welcome__date" data-welcome-font="">
                {isPlaceholder(dateText) ? (
                  <ConfigText value={dateText} />
                ) : (
                  <time dateTime={event.date}>
                    <span className="welcome__date-part">{dateStart}</span>
                    {dateRest && ' '}
                    {dateRest && <span className="welcome__date-part">{dateRest}</span>}
                  </time>
                )}
              </p>
            )}
            {venue.name && (
              <p className="welcome__venue" data-welcome-font="">
                <ConfigText value={venue.name} />
              </p>
            )}
          </div>

          <button
            ref={buttonRef}
            type="button"
            className="welcome__open welcome__item"
            style={{ '--welcome-i': 7 }}
            onClick={handleOpen}
          >
            <span ref={sealRef} className="welcome__seal" aria-hidden="true">
              <span className="welcome__seal-ring" />
              <span className="welcome__seal-ring welcome__seal-ring--late" />
              <span className="welcome__seal-disc">
                <Seal uid="welcome-seal" />
              </span>
            </span>
            <span className="welcome__open-label">{openLabel}</span>
          </button>
        </div>
      </div>

      {loaderMounted && (
        <div className="welcome__loader" role="status" aria-hidden={isLoading ? undefined : true}>
          <div className="welcome__loader-stack" aria-hidden="true">
            <div className="welcome__loader-halo">
              <Mandala className="welcome__loader-art" size={232} strokeWidth={0.9} />
            </div>
            <svg className="welcome__loader-orbit" viewBox="0 0 100 100" focusable="false">
              <circle cx="50" cy="50" r="49" fill="none" stroke="var(--gold-deep)" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="34 119.94" />
            </svg>
            <div className="welcome__loader-medallion">
              <span
                className={`welcome__monogram${monogramReady ? ' welcome__monogram--ready' : ''}`}
                data-welcome-font="monogram"
              >
                <span>{initialOf(groomName)}</span>
                <span className="welcome__monogram-amp">&amp;</span>
                <span>{initialOf(brideName)}</span>
              </span>
            </div>
          </div>
          <span className="sr-only">Loading the invitation…</span>
        </div>
      )}
    </div>
  );
}
