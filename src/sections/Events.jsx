import { useRef } from 'react';
import { CalendarDays, CalendarPlus, Clock, MapPin, Shirt, Sparkles, Utensils } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Corner, Divider, Mandala } from '../components/Ornament.jsx';
import { Garland, Lotus, Marigold } from '../components/Florals.jsx';
import { wedding, isPlaceholder, cleanPlaceholder } from '../config/wedding.js';
import { useOnScreen } from '../hooks/useOnScreen.js';
import ConfigText from '../components/ConfigText.jsx';
import { getCalendarUrl } from '../utils/links.js';
import '../styles/events.css';

/**
 * Wedding events — one invitation card per entry in `wedding.events`.
 *
 * Every card has the same five rows (coloured band with the titles · date seal ·
 * description · details · "Add to Calendar"), so on wide screens the rows of
 * neighbouring cards line up. `event.theme` only swaps the palette and the artwork:
 *   haldi   → turmeric band, marigold toran, date seal in the heart of a marigold
 *   puja    → champagne-gold band, maroon lotus crest, date seal in a gold mandala
 *   (other) → maroon and gold band, lotus crest, date seal in a gold mandala
 *
 * An event is held at the main venue unless it has its own `venue` text.
 */

const THEMES = ['haldi', 'puja'];
const EXTRA_ICONS = { lunch: Utensils };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Splits a calendar date (YYYY-MM-DD) into the parts of the date seal — no timezone maths involved. */
function getDateParts(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate || '');
  if (!match) return null;
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return null;
  const weekday = WEEKDAYS[new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay()];
  if (!weekday) return null;
  return { weekday, day, month: monthName, year };
}

const isValidDate = (value) => Boolean(value) && !Number.isNaN(new Date(value).getTime());

/** `dressCode` may be one line or a list of lines; "Men: Yellow kurta" is split at the colon. */
function getDressLines(dressCode) {
  const lines = (Array.isArray(dressCode) ? dressCode : [dressCode]).filter((line) => typeof line === 'string' && line.trim());
  return lines.map((line) => {
    const colon = isPlaceholder(line) ? -1 : line.indexOf(':');
    return colon > 0 && colon < line.length - 1
      ? { who: line.slice(0, colon).trim(), wear: line.slice(colon + 1).trim() }
      : { who: '', wear: line.trim() };
  });
}

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true, focusable: false };

/** Ornament shown under the title when an event has no highlight line. */
function Flourish({ theme }) {
  if (theme === 'haldi') {
    return (
      <span className="events__flourish" aria-hidden="true">
        <Marigold size={13} />
        <Marigold size={21} />
        <Marigold size={13} />
      </span>
    );
  }
  return (
    <span className="events__flourish events__flourish--plain" aria-hidden="true">
      <Divider width={132} color="var(--gold-light)" />
    </span>
  );
}

function EventCard({ event, venueName }) {
  const theme = THEMES.includes(event.theme) ? event.theme : 'wedding';
  const titleId = `events-${event.id}-title`;
  const date = getDateParts(event.date);
  const highlight = event.highlight || event.muhurat;
  const dressLines = getDressLines(event.dressCode);
  const dressPending = dressLines.length === 1 && isPlaceholder(dressLines[0].wear);
  const extras = (event.extras || []).filter((extra) => extra && extra.label && extra.value);
  const ownVenue = typeof event.venue === 'string' ? event.venue.trim() : '';
  const atMainVenue = event.venue === undefined;
  // With start and end times the calendar entry is timed; with only a date it is an all-day one.
  const canAddToCalendar = (isValidDate(event.start) && isValidDate(event.end)) || Boolean(date);
  const ctaClass = { haldi: 'events__cta--haldi', puja: 'btn--gold' }[theme] || 'btn--primary';

  return (
    <article className={`events__card events__card--${theme}`} aria-labelledby={titleId}>
      <span className="events__ring" aria-hidden="true" />

      <div className="events__panel frame">
        {theme === 'haldi' ? (
          <>
            <Garland swags={8} className="events__garland" />
            <Marigold size={78} className="events__bud events__bud--left" />
            <Marigold size={62} className="events__bud events__bud--right" />
          </>
        ) : (
          <>
            <Corner corner="tl" size={50} color={theme === 'puja' ? 'var(--maroon)' : undefined} className="events__corner events__corner--tl" />
            <Corner corner="tr" size={50} color={theme === 'puja' ? 'var(--maroon)' : undefined} className="events__corner events__corner--tr" />
            <Corner corner="bl" size={50} className="events__corner events__corner--bl" />
            <Corner corner="br" size={50} className="events__corner events__corner--br" />
          </>
        )}

        <header className="events__header">
          {theme !== 'haldi' && (
            <Lotus size={60} color={theme === 'puja' ? 'var(--maroon)' : 'var(--gold-light)'} strokeWidth={1.3} className="events__lotus" />
          )}
          {event.nativeName && (
            <p className="events__native deva" lang="mr">{event.nativeName}</p>
          )}
          <h3 id={titleId} className="events__name"><ConfigText value={event.name} /></h3>
          {highlight ? (
            <p className="events__muhurat"><span><ConfigText value={highlight} /></span></p>
          ) : (
            <Flourish theme={theme} />
          )}
        </header>

        {/* The seal repeats the date given in the details below, so it is hidden from assistive tech. */}
        <div className="events__when">
          {date && (
            <div className="events__seal" aria-hidden="true">
              <span className="events__halo">
                {theme === 'haldi' ? <Marigold size={200} /> : <Mandala size={200} strokeWidth={1.1} />}
              </span>
              <span className="events__disc">
                <span className="events__seal-small">{date.weekday}</span>
                <span className="events__seal-day">{date.day}</span>
                <span className="events__seal-small">{date.month} {date.year}</span>
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="events__desc"><ConfigText value={event.description} /></p>
        )}

        <dl className="events__details">
          {event.displayDate && (
            <div className="events__row">
              <dt><CalendarDays className="events__icon" {...ICON} />Date</dt>
              <dd>
                {date ? <time dateTime={event.date}>{event.displayDate}</time> : <ConfigText value={event.displayDate} />}
              </dd>
            </div>
          )}
          {event.time && (
            <div className="events__row">
              <dt><Clock className="events__icon" {...ICON} />Time</dt>
              <dd><ConfigText value={event.time} /></dd>
            </div>
          )}
          {extras.map((extra) => {
            const ExtraIcon = EXTRA_ICONS[extra.icon] || Sparkles;
            return (
              <div className="events__row" key={extra.label}>
                <dt><ExtraIcon className="events__icon" {...ICON} /><ConfigText value={extra.label} /></dt>
                <dd>
                  <ConfigText value={extra.value} />
                  {extra.native && <span className="events__row-native deva" lang="mr">{extra.native}</span>}
                </dd>
              </div>
            );
          })}
          {atMainVenue && venueName && (
            <div className="events__row">
              <dt><MapPin className="events__icon" {...ICON} />Venue</dt>
              <dd>
                <a className="events__venue-link" href="#venue">
                  <span className="events__venue-name"><ConfigText value={venueName} /></span>
                  <span className="sr-only">, see venue details and directions</span>
                </a>
              </dd>
            </div>
          )}
          {ownVenue && (
            <div className="events__row">
              <dt><MapPin className="events__icon" {...ICON} />Venue</dt>
              <dd><ConfigText value={ownVenue} /></dd>
            </div>
          )}
          {dressPending && (
            <div className="events__row events__row--pending">
              <dt>
                <Shirt className="events__icon" {...ICON} />
                Dress Code
                <span className="events__tba">To be announced</span>
              </dt>
              <dd><ConfigText value={dressLines[0].wear} /></dd>
            </div>
          )}
          {!dressPending && dressLines.length > 0 && (
            <div className="events__row events__row--dress">
              <dt><Shirt className="events__icon" {...ICON} />Dress Code</dt>
              <dd>
                {dressLines.map((line) => (
                  <span className="events__dress-line" key={`${line.who}-${line.wear}`}>
                    {line.who && <span className="events__dress-who">{line.who}</span>}
                    <span className="events__dress-wear"><ConfigText value={line.wear} /></span>
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <div className="events__footer">
          {canAddToCalendar && (
            <a
              className={`btn events__cta ${ctaClass}`}
              href={getCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarPlus size={18} strokeWidth={1.5} aria-hidden="true" focusable="false" />
              <span>
                Add to Calendar
                <span className="sr-only">: {cleanPlaceholder(event.name)} (opens in a new tab)</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Events() {
  const sectionRef = useRef(null);
  const live = useOnScreen(sectionRef, { rootMargin: '12% 0px' });
  const { events, venue } = wedding;

  return (
    <section
      id="events"
      ref={sectionRef}
      className={`section events${live ? ' events--live' : ''}`}
      aria-labelledby="events-title"
    >
      <div className="container">
        <SectionHeading id="events-title" eyebrow="Save the Dates" title="Wedding Events" />
        <ul className="events__grid" role="list">
          {events.map((event, index) => (
            <Reveal as="li" key={event.id} className="events__item" delay={index * 160}>
              <EventCard event={event} venueName={venue.name} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
