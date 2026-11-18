import { useRef } from 'react';
import { CalendarDays, Info, MapPin, Navigation } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Corner, Mandala } from '../components/Ornament.jsx';
import { Blossom, Marigold } from '../components/Florals.jsx';
import { wedding, isPlaceholder, cleanPlaceholder } from '../config/wedding.js';
import { useOnScreen } from '../hooks/useOnScreen.js';
import ConfigText from '../components/ConfigText.jsx';
import { keepTitlesTogether } from '../utils/text.js';
import { getMapsUrl } from '../utils/links.js';
import '../styles/venue.css';

/**
 * Venue — where both celebrations take place.
 *
 * The panel beside the card is an ornamental mandap drawing, deliberately NOT an
 * embedded map: until `venue.mapsUrl` holds the official share link, a map built
 * from a name search could show the wrong place. The "to be confirmed" note under
 * the button disappears by itself as soon as `mapsUrl` is filled in.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Points along a hanging garland between two hooks at the same height. */
const swag = (x0, x1, y, dip, count) =>
  Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    return { x: x0 + (x1 - x0) * t, y: y + 4 * dip * t * (1 - t) };
  });

const GARLAND = [...swag(107, 180, 242, 36, 10), ...swag(180, 253, 242, 36, 10)];
const TASSELS = [107, 180, 253];
const SPARKLES = [
  { x: 86, y: 140, s: 0.9 }, { x: 277, y: 131, s: 0.7 }, { x: 54, y: 208, s: 0.6 },
  { x: 309, y: 199, s: 0.8 }, { x: 121, y: 97, s: 0.55 }, { x: 243, y: 87, s: 0.6 },
];

function BananaPlant({ transform }) {
  return (
    <g transform={transform}>
      <path className="venue__leaf" d="M33 312C16 304 8 282 12 258C27 268 34 288 33 312Z" />
      <path className="venue__vein" d="M33 312C26 296 18 278 12 258" />
      <path className="venue__leaf" d="M35 322C50 312 58 294 56 272C43 282 36 300 35 322Z" />
      <path className="venue__vein" d="M35 322C42 308 50 292 56 272" />
      <path className="venue__leaf" d="M35 318C46 320 54 330 56 344C45 342 37 332 35 318Z" />
      <path className="venue__vein" d="M35 318C44 324 51 333 56 344" />
      <path className="venue__leaf" d="M34 306C26 284 29 258 38 240C46 260 44 286 34 306Z" />
      <path className="venue__vein" d="M34 306C34 284 35 262 38 240" />
      <path className="venue__leaf" d="M31.5 382C32.5 352 32.5 328 33 304H35.5C36 328 36.5 352 37 382Z" />
    </g>
  );
}

/** Line drawing of a wedding mandap: plinth, garlanded pillars, domed canopy and the sacred fire. */
function MandapArt() {
  return (
    <svg className="venue__mandap" viewBox="0 0 360 420" aria-hidden="true" focusable="false">
      {/* inner arch of the frame */}
      <path className="venue__arch" d="M9 395V180a171 171 0 0 1 342 0v215a16 16 0 0 1-16 16H25a16 16 0 0 1-16-16z" />

      {SPARKLES.map((p) => (
        <path
          key={`${p.x}-${p.y}`}
          className="venue__spark"
          transform={`translate(${p.x} ${p.y}) scale(${p.s})`}
          d="M0-7C.9-2.6 2.6-.9 7 0 2.6.9.9 2.6 0 7-.9 2.6-2.6.9-7 0-2.6-.9-.9-2.6 0-7z"
        />
      ))}

      {/* a banana plant on either side of the mandap */}
      <BananaPlant transform="translate(8 0)" />
      <BananaPlant transform="translate(352 0) scale(-1 1)" />

      {/* ground + plinth */}
      <path className="venue__line" d="M24 382H336" />
      <path className="venue__line venue__line--fine" d="M104 391H256" />
      <rect className="venue__solid" x="70" y="356" width="220" height="12" rx="3" />
      <rect className="venue__solid" x="48" y="368" width="264" height="14" rx="3" />
      {Array.from({ length: 15 }, (_, i) => (
        <circle key={i} className="venue__dot" cx={68 + i * 16} cy="375" r="1.3" />
      ))}

      {/* far pillars */}
      <g opacity="0.5">
        <rect className="venue__solid" x="135" y="240" width="10" height="116" />
        <rect className="venue__solid" x="215" y="240" width="10" height="116" />
      </g>

      {/* the couple's seats and the sacred fire */}
      <rect className="venue__seat" x="116" y="347" width="28" height="9" rx="4.5" />
      <rect className="venue__seat" x="216" y="347" width="28" height="9" rx="4.5" />
      <path className="venue__solid" d="M162 356L167 339H193L198 356Z" />
      <path className="venue__line venue__line--fine" d="M164.5 347.5H195.5" />
      <path className="venue__flame" d="M180 308C189 319 191 329 180 339C169 329 171 319 180 308Z" />
      <path className="venue__flame venue__flame--core" d="M180 320C185 326 186 332 180 338C174 332 175 326 180 320Z" />

      {/* near pillars */}
      <rect className="venue__solid" x="88" y="250" width="16" height="98" />
      <rect className="venue__solid" x="82" y="240" width="28" height="10" rx="2" />
      <rect className="venue__solid" x="82" y="348" width="28" height="8" rx="2" />
      <path className="venue__line venue__line--fine" d="M88 272L104 262M88 294L104 284M88 316L104 306M88 338L104 328" />
      <rect className="venue__solid" x="256" y="250" width="16" height="98" />
      <rect className="venue__solid" x="250" y="240" width="28" height="10" rx="2" />
      <rect className="venue__solid" x="250" y="348" width="28" height="8" rx="2" />
      <path className="venue__line venue__line--fine" d="M272 272L256 262M272 294L256 284M272 316L256 306M272 338L256 328" />

      {/* canopy */}
      <rect className="venue__solid" x="72" y="226" width="216" height="14" rx="3" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} className="venue__dot" cx={90 + i * 20} cy="233" r="1.5" />
      ))}
      <path className="venue__roof" d="M58 226L80 206H280L302 226Z" />
      <path className="venue__dome" d="M82 206C76 192 86 182 96 174C106 182 116 192 110 206Z" />
      <path className="venue__dome" d="M250 206C244 192 254 182 264 174C274 182 284 192 278 206Z" />
      <path className="venue__line" d="M96 167V160M264 167V160" />
      <circle className="venue__dot" cx="96" cy="170" r="3" />
      <circle className="venue__dot" cx="264" cy="170" r="3" />
      <path
        className="venue__dome"
        d="M130 206C108 178 132 160 160 150C172 146 178 140 180 128C182 140 188 146 200 150C228 160 252 178 230 206Z"
      />
      <path className="venue__line venue__line--fine" d="M180 130V206M180 130C168 152 158 178 160 206M180 130C192 152 202 178 200 206" />
      <circle className="venue__solid" cx="180" cy="121" r="5" />
      <circle className="venue__solid" cx="180" cy="112" r="3" />
      <path className="venue__line" d="M180 109V95" />
      <path className="venue__flag" d="M180 95l15 4.5-15 4.5z" />
      <path className="venue__line venue__line--dotted" d="M180 78V89" />

      {/* marigold garlands between the pillars */}
      {TASSELS.map((x) => (
        <g key={x}>
          <path className="venue__leaf" d={`M${x} 262c4.5 6 4.5 13 0 19c-4.5-6-4.5-13 0-19z`} />
          <circle className="venue__bead" cx={x} cy="246" r="3.6" />
          <circle className="venue__bead venue__bead--alt" cx={x} cy="253.5" r="3.6" />
          <circle className="venue__bead" cx={x} cy="261" r="3.6" />
        </g>
      ))}
      {GARLAND.map((p, i) => (
        <circle
          key={`${p.x}-${p.y}`}
          className={`venue__bead${i % 2 ? ' venue__bead--alt' : ''}`}
          cx={p.x.toFixed(1)}
          cy={p.y.toFixed(1)}
          r="3.5"
        />
      ))}
    </svg>
  );
}

/** A marker that echoes the artwork of the matching event card. */
function EventMarker({ theme }) {
  return theme === 'haldi'
    ? <Marigold size={22} className="venue__marker" />
    : <Blossom size={22} tone="maroon" className="venue__marker" />;
}

function AddressLine({ value }) {
  if (!value) return null;
  return (
    <span className={`venue__address-line${isPlaceholder(value) ? ' placeholder-text' : ''}`}>
      {keepTitlesTogether(cleanPlaceholder(value))}
    </span>
  );
}

export default function Venue() {
  const sectionRef = useRef(null);
  const live = useOnScreen(sectionRef, { rootMargin: '12% 0px' });
  const { venue } = wedding;
  // Only the events held here: an event with its own `venue` text is somewhere else.
  const events = wedding.events.filter((event) => event.venue === undefined);
  const mapPending = !venue.mapsUrl;
  const venueName = cleanPlaceholder(venue.name);

  return (
    <section
      id="venue"
      ref={sectionRef}
      className={`section venue${live ? ' venue--live' : ''}`}
      aria-labelledby="venue-title"
    >
      <div className="container">
        <SectionHeading id="venue-title" eyebrow="The Venue" title={<ConfigText value={venue.name} />} />

        <div className="venue__layout">
          <Reveal variant="zoom" className="venue__art-wrap">
            <div className="venue__art" aria-hidden="true">
              <Mandala size={236} strokeWidth={1} className="venue__halo" />
              <MandapArt />
              <span className="venue__pin">
                <MapPin strokeWidth={1.5} aria-hidden="true" focusable="false" />
              </span>
            </div>
          </Reveal>

          <Reveal delay={140} className="venue__card frame">
            <Corner corner="tr" className="venue__corner venue__corner--tr" />
            <Corner corner="bl" className="venue__corner venue__corner--bl" />

            <div className="venue__block">
              <h3 className="venue__label">
                <MapPin size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                Address
              </h3>
              <p className="venue__address">
                <span className="venue__name"><ConfigText value={venue.name} /></span>
                <AddressLine value={venue.address} />
                <AddressLine value={venue.city} />
              </p>
              {venue.addressNative && (
                <p className="venue__address-native deva" lang="mr">{venue.addressNative}</p>
              )}
              {venue.note && <p className="venue__note"><ConfigText value={venue.note} /></p>}
            </div>

            {events.length > 0 && (
              <div className="venue__block">
                <h3 className="venue__label">
                  <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                  Schedule
                </h3>
                <ul className="venue__schedule" role="list">
                  {events.map((event) => (
                    <li key={event.id} className="venue__event">
                      <EventMarker theme={event.theme} />
                      <div className="venue__event-text">
                        <span className="venue__event-name"><ConfigText value={event.name} /></span>
                        <span className="venue__event-when">
                          <span className="venue__event-when-inner">
                            {event.displayDate && (
                              ISO_DATE.test(event.date)
                                ? <time dateTime={event.date}>{event.displayDate}</time>
                                : <span><ConfigText value={event.displayDate} /></span>
                            )}
                            {event.time && <span><ConfigText value={event.time} /></span>}
                          </span>
                        </span>
                        {(event.extras || []).filter((extra) => extra && extra.label && extra.value).map((extra) => (
                          <span className="venue__event-extra" key={extra.label}>
                            <ConfigText value={extra.label} />: <ConfigText value={extra.value} />
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="venue__actions">
              <a
                className="btn btn--primary venue__cta"
                href={getMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-describedby={mapPending ? 'venue-map-note' : undefined}
              >
                <Navigation size={18} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                <span>
                  Get Directions
                  <span className="sr-only"> to {venueName} (opens the map in a new tab)</span>
                </span>
              </a>
              {mapPending && (
                <p id="venue-map-note" className="venue__map-note">
                  <Info className="venue__map-note-icon" size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                  <span>
                    <span className="venue__map-note-tag">Map link to be confirmed</span>
                    <span className="placeholder-text venue__map-note-text">
                      The exact map link is yet to be added. For now, the button searches Google Maps
                      for &ldquo;{venue.mapsQuery || venueName}&rdquo;.
                    </span>
                  </span>
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
