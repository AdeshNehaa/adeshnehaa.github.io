import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { wedding } from '../config/wedding.js';
import { Divider, Mandala } from './Ornament.jsx';
import { FloralSpray } from './Florals.jsx';
import '../styles/navbar.css';

/**
 * Navbar — fixed top bar.
 *   · transparent over the hero, ivory + blur once the page has scrolled ~40px
 *   · ≥ 1024px: inline links · below: a hamburger opening a full-screen menu
 *   · scroll-spy marks the section in view with aria-current="location"
 * One list of links serves both layouts; CSS decides how it is presented.
 */

const MENU_ID = 'navbar-menu';
const DESKTOP_QUERY = '(min-width: 1024px)';
const hasObserver = () => typeof window !== 'undefined' && 'IntersectionObserver' in window;

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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const sentinelRef = useRef(null);

  const { couple, nav } = wedding;
  const groomName = couple.groom.name;
  const brideName = couple.bride.name;

  /** Closes the mobile menu. Focus returns to the hamburger unless a link is taking the guest elsewhere. */
  const closeMenu = useCallback((returnFocus) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  /* ── Solid bar after ~40px: a 40px sentinel at the top of the page leaves the viewport ── */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasObserver()) {
      setScrolled(true); // no observer: stay readable over any section
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  /* ── Scroll-spy (IntersectionObserver only, no scroll handlers) ──
     A section counts as current once its top has risen into the upper 38% of the
     viewport; the last such section wins. Sections that do not exist are skipped. */
  useEffect(() => {
    if (!hasObserver()) return undefined;
    const sections = nav.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const last = sections[sections.length - 1];
    const inBand = new Set();
    let atEnd = false;
    const update = () => {
      let current = '';
      sections.forEach((el) => { if (inBand.has(el)) current = el.id; });
      if (atEnd) current = last.id; // a short final section can never reach the band
      if (current) setActive(current);
    };

    const band = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) inBand.add(entry.target);
          else inBand.delete(entry.target);
        });
        update();
      },
      { rootMargin: '0px 0px -62% 0px' }
    );
    const end = new IntersectionObserver(
      ([entry]) => {
        atEnd = entry.intersectionRatio >= 0.98;
        update();
      },
      { threshold: [0.98] }
    );
    sections.forEach((el) => band.observe(el));
    end.observe(last);
    return () => {
      band.disconnect();
      end.disconnect();
    };
  }, [nav]);

  /* ── While the mobile menu is open: lock scroll, trap focus, close on Escape ── */
  useEffect(() => {
    if (!open) return undefined;
    const header = headerRef.current;
    if (!header) return undefined;

    document.body.classList.add('nav-open');

    // The page behind the menu is out of reach for keyboards and screen readers.
    const covered = Array.from(header.parentElement?.children ?? []).filter(
      (el) => el !== header && !el.hasAttribute('inert')
    );
    covered.forEach((el) => el.setAttribute('inert', ''));

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(header.querySelectorAll('a[href], button:not([disabled])')).filter(
        (el) => el.getClientRects().length > 0
      );
      if (!items.length) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      const current = document.activeElement;
      if (!header.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? lastItem : first).focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && current === lastItem) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Rotating or resizing into the desktop layout dismisses the menu.
    const mq = window.matchMedia ? window.matchMedia(DESKTOP_QUERY) : null;
    const onWide = (e) => { if (e.matches) closeMenu(false); };
    mq?.addEventListener?.('change', onWide);

    return () => {
      document.body.classList.remove('nav-open');
      covered.forEach((el) => el.removeAttribute('inert'));
      document.removeEventListener('keydown', onKeyDown);
      mq?.removeEventListener?.('change', onWide);
    };
  }, [open, closeMenu]);

  // Any tap inside the open menu closes it: a link (the browser then scrolls to
  // its section) or the empty backdrop around the links.
  const handleMenuClick = (e) => {
    if (!open) return;
    closeMenu(!e.target.closest('a'));
  };

  const className = ['navbar', scrolled && 'navbar--scrolled', open && 'navbar--open'].filter(Boolean).join(' ');

  return (
    <>
      <span ref={sentinelRef} className="navbar__sentinel" aria-hidden="true" />
      <header ref={headerRef} className={className}>
        <div className="navbar__bg" aria-hidden="true" />
        <div className="navbar__bar">
          <a className="navbar__brand" href="#home" onClick={() => open && closeMenu(false)}>
            <span className="navbar__brand-mark">
              {initialOf(groomName)}
              <span className="navbar__brand-amp">&amp;</span>
              {initialOf(brideName)}
            </span>
            <span className="sr-only"> — {groomName} &amp; {brideName}, home</span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            className="navbar__toggle"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="navbar__toggle-icon navbar__toggle-icon--menu" size={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
            <X className="navbar__toggle-icon navbar__toggle-icon--close" size={22} strokeWidth={1.5} aria-hidden="true" focusable="false" />
          </button>

          <nav id={MENU_ID} className="navbar__menu" aria-label="Main" onClick={handleMenuClick}>
            <div className="navbar__art" aria-hidden="true">
              <span className="navbar__pattern section--pattern" />
              <span className="navbar__mandala">
                <Mandala className="navbar__mandala-art" size={520} strokeWidth={0.5} />
              </span>
              <span className="navbar__spray navbar__spray--bl">
                <FloralSpray corner="bl" className="navbar__spray-art" />
              </span>
              <span className="navbar__spray navbar__spray--br">
                <FloralSpray corner="br" className="navbar__spray-art" />
              </span>
            </div>

            <ul className="navbar__list">
              {nav.map((item, index) => (
                <li key={item.id} className="navbar__item" style={{ '--navbar-i': index }}>
                  <a
                    className="navbar__link"
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'location' : undefined}
                  >
                    <span className="navbar__link-text">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="navbar__foot" aria-hidden="true">
              <Divider className="navbar__foot-divider" />
              <p className="navbar__foot-names script">
                {groomName} <span className="navbar__foot-amp">&amp;</span> {brideName}
              </p>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
