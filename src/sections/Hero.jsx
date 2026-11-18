import { useRef } from 'react';
import { CalendarHeart, ChevronsDown, MapPin } from 'lucide-react';
import { wedding, isPlaceholder, cleanPlaceholder } from '../config/wedding.js';
import { useOnScreen } from '../hooks/useOnScreen.js';
import ConfigText from '../components/ConfigText.jsx';
import { Divider, Mandala } from '../components/Ornament.jsx';
import { FloralSpray, FallingPetals } from '../components/Florals.jsx';
import '../styles/hero.css';

const SPRAY_CORNERS = ['tl', 'tr', 'bl', 'br'];

/** "Saturday, 05 December 2026" → ['Saturday', '05 December 2026'], so the weekday can sit on its own line. */
function splitDate(text = '') {
  const comma = text.indexOf(',');
  if (isPlaceholder(text) || comma === -1) return ['', text];
  return [text.slice(0, comma).trim(), text.slice(comma + 1).trim()];
}

/** Rough width, in em, of a name set in the script face — lets the CSS keep unusually long names inside the card. */
const scriptEm = (name = '') => 0.7 + 0.36 * Array.from(isPlaceholder(name) ? cleanPlaceholder(name) : name).length;

/**
 * Hero — the first thing seen once the invitation is opened.
 * `opened` turns true when the welcome overlay has finished opening; only then
 * does the staggered entrance play (blessing → invite → names → date → buttons).
 */
export default function Hero({ opened = false }) {
  const sectionRef = useRef(null);
  const onScreen = useOnScreen(sectionRef, { initial: true });

  const { couple, venue, messages } = wedding;
  const event = wedding.events.find((e) => e.id === 'wedding') ?? wedding.events[wedding.events.length - 1];
  const [weekday, dayText] = splitDate(event?.displayDate);

  const groomEm = scriptEm(couple.groom.name);
  const brideEm = scriptEm(couple.bride.name);
  const nameFit = {
    '--hero-stack-em': Math.max(groomEm, brideEm).toFixed(2), // names stacked (phones)
    '--hero-row-em': (groomEm + brideEm + 1.3).toFixed(2), // names on one line with the "&"
  };

  const className = ['hero', opened && 'hero--opened', !onScreen && 'hero--away'].filter(Boolean).join(' ');

  return (
    <section id="home" ref={sectionRef} className={className} aria-labelledby="hero-title">
      <div className="hero__decor" aria-hidden="true">
        <span className="hero__frame" />
        {SPRAY_CORNERS.map((corner) => (
          <span key={corner} className={`hero__spray hero__spray--${corner}`}>
            <span className="hero__spray-sway">
              <FloralSpray corner={corner} className="hero__spray-art" />
            </span>
          </span>
        ))}
      </div>

      {/* Petals only fall while the hero is actually being looked at. */}
      {opened && onScreen && <FallingPetals count={12} className="hero__petals" />}

      <div className="hero__content">
        {messages.welcomeBlessing && (
          <p className="hero__blessing hero__item deva" lang="sa" style={{ '--i': 0 }}>
            {messages.welcomeBlessing}
          </p>
        )}

        {messages.heroInvite && (
          <p className="hero__invite hero__item" style={{ '--i': 1 }}>
            <ConfigText value={messages.heroInvite} />
          </p>
        )}

        <div className="hero__names-wrap">
          <div className="hero__mandala">
            <Mandala className="hero__mandala-art" size={680} strokeWidth={0.45} />
          </div>
          <h1 id="hero-title" className="hero__names" style={nameFit}>
            <span className="hero__name hero__item" style={{ '--i': 2 }}><ConfigText value={couple.groom.name} /></span>{' '}
            <span className="hero__amp hero__item" style={{ '--i': 3 }}>
              <span className="hero__amp-rule" aria-hidden="true" />
              <span className="hero__amp-glyph">&amp;</span>
              <span className="hero__amp-rule" aria-hidden="true" />
            </span>{' '}
            <span className="hero__name hero__item" style={{ '--i': 4 }}><ConfigText value={couple.bride.name} /></span>
          </h1>
        </div>

        <div className="hero__details hero__item" style={{ '--i': 5 }}>
          <Divider className="hero__divider" />
          {event && (
            <p className="hero__date">
              <time dateTime={event.start}>
                {weekday && <span className="hero__weekday">{weekday}</span>}
                {weekday && <span className="sr-only">, </span>}
                <span className="hero__day"><ConfigText value={dayText} /></span>
              </time>
            </p>
          )}
          <p className="hero__where">
            {event?.time && <span className="hero__time"><ConfigText value={event.time} /></span>}
            {/* a real space that carries the gold gem; if the line wraps here it collapses, gem and all */}
            {event?.time && venue.name && <span className="hero__gem">{' '}</span>}
            {venue.name && <span className="hero__venue"><ConfigText value={venue.name} /></span>}
          </p>
        </div>

        <div className="hero__actions hero__item" style={{ '--i': 6 }}>
          <a className="btn btn--primary hero__btn" href="#events">
            <CalendarHeart size={18} strokeWidth={1.5} aria-hidden="true" />
            View Events
          </a>
          <a className="btn btn--ghost hero__btn" href="#venue">
            <MapPin size={18} strokeWidth={1.5} aria-hidden="true" />
            Venue &amp; Directions
          </a>
        </div>
      </div>

      <a className="hero__cue hero__item" href="#couple" style={{ '--i': 7 }}>
        <span className="hero__cue-label">
          Scroll<span className="sr-only"> down to meet the couple</span>
        </span>
        <ChevronsDown className="hero__cue-icon" size={20} strokeWidth={1.5} aria-hidden="true" />
      </a>
    </section>
  );
}
