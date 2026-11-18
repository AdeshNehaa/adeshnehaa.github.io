import { useEffect, useRef } from 'react';
import { wedding, isPlaceholder, cleanPlaceholder } from '../config/wedding.js';
import ConfigText from '../components/ConfigText.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Mandala } from '../components/Ornament.jsx';
import { Lotus } from '../components/Florals.jsx';
import { useCountdown } from '../hooks/useCountdown.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import '../styles/countdown.css';

const pad = (n) => String(n).padStart(2, '0');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** A config value without its [placeholder] brackets. */
const plain = (value) => (isPlaceholder(value) ? cleanPlaceholder(value) : value);

/** Gradients shared by the four tile frames. */
function TileDefs() {
  return (
    <svg className="countdown__defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="countdown-tile-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-light)" />
          <stop offset="0.45" stopColor="var(--gold)" />
          <stop offset="0.75" stopColor="var(--gold-deep)" />
          <stop offset="1" stopColor="var(--gold-light)" />
        </linearGradient>
        <linearGradient id="countdown-tile-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--maroon-soft)" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="var(--maroon-deep)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--maroon-deep)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Gold plaque with scooped corners, an inner hairline, corner pearls and two jewels. */
function TileFrame() {
  return (
    <svg className="countdown__frame" viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {/* paint servers are referenced from attributes (not the stylesheet) so they resolve against this document */}
      <path
        className="countdown__frame-plate"
        fill="url(#countdown-tile-fill)"
        stroke="url(#countdown-tile-gold)"
        d="M11 2H89A9 9 0 0 0 98 11V109A9 9 0 0 0 89 118H11A9 9 0 0 0 2 109V11A9 9 0 0 0 11 2Z"
      />
      <path
        className="countdown__frame-inner"
        d="M15.1 7H84.9A14 14 0 0 0 93 15.1V104.9A14 14 0 0 0 84.9 113H15.1A14 14 0 0 0 7 104.9V15.1A14 14 0 0 0 15.1 7Z"
      />
      <g className="countdown__frame-gems">
        <circle cx="4.6" cy="4.6" r="1.5" />
        <circle cx="95.4" cy="4.6" r="1.5" />
        <circle cx="4.6" cy="115.4" r="1.5" />
        <circle cx="95.4" cy="115.4" r="1.5" />
        <path d="M50 -1.6L53.6 2L50 5.6L46.4 2Z" />
        <path d="M50 114.4L53.6 118L50 121.6L46.4 118Z" />
      </g>
    </svg>
  );
}

/**
 * One fixed-width digit, so nothing shifts as the numbers change.
 * When the digit changes, the old one slips away as the new one settles in.
 */
function Digit({ char, animate }) {
  const previous = useRef(char);
  const old = previous.current;
  useEffect(() => {
    previous.current = char;
  }, [char]);
  const ticking = animate && old !== char;

  return (
    <span className="countdown__digit">
      {ticking && (
        <span key={`out-${old}`} className="countdown__numeral countdown__numeral--out">{old}</span>
      )}
      <span key={`in-${char}`} className={`countdown__numeral${ticking ? ' countdown__numeral--in' : ''}`}>
        {char}
      </span>
    </span>
  );
}

function Tile({ label, value, animate }) {
  const chars = value.split('');
  return (
    <div className="countdown__tile">
      <TileFrame />
      <span className={`countdown__value${chars.length > 2 ? ' countdown__value--long' : ''}`}>
        {/* keyed from the right so the units digit keeps its identity */}
        {chars.map((char, i) => (
          <Digit key={chars.length - i} char={char} animate={animate} />
        ))}
      </span>
      <span className="countdown__label">{label}</span>
    </div>
  );
}

/** Countdown — a live count of the days, hours, minutes and seconds to the wedding. */
export default function Countdown() {
  const { days, hours, minutes, seconds, done } = useCountdown(wedding.weddingDate);
  const reduced = useReducedMotion();

  const { groom, bride } = wedding.couple;
  const event = wedding.events.find((e) => e.id === 'wedding') ?? wedding.events[wedding.events.length - 1];

  const tiles = [
    { label: 'Days', value: pad(days) },
    { label: 'Hours', value: pad(hours) },
    { label: 'Minutes', value: pad(minutes) },
    { label: 'Seconds', value: pad(seconds) },
  ];

  return (
    <section id="countdown" className="section countdown" aria-labelledby="countdown-title">
      <TileDefs />
      <div className="countdown__decor" aria-hidden="true">
        <Mandala className="countdown__mandala countdown__mandala--left" size={520} color="var(--gold-light)" strokeWidth={0.5} />
        <Mandala className="countdown__mandala countdown__mandala--right" size={520} color="var(--gold-light)" strokeWidth={0.5} />
      </div>

      <div className="container">
        <SectionHeading
          id="countdown-title"
          light
          eyebrow={done ? 'The wait is over' : 'Counting down to'}
          title="The Big Day"
        />

        {done ? (
          <Reveal key="done" className="countdown__done" variant="zoom">
            <p className="countdown__done-line">The auspicious moment is here</p>
            <p className="countdown__done-note">
              With your blessings, {plain(groom.name)}&nbsp;&amp;&nbsp;{plain(bride.name)} begin their journey together.
            </p>
          </Reveal>
        ) : (
          /* role="timer" is a live region that stays quiet (aria-live="off"); the
             sentence below is its text alternative and only changes once a minute.
             (The keys make React swap the two blocks, so the line fades in at the moment.) */
          <Reveal key="timer" className="countdown__timer" role="timer" aria-live="off" aria-label="Time left until the wedding">
            <p className="sr-only">
              {plural(days, 'day')}, {plural(hours, 'hour')} and {plural(minutes, 'minute')} to go.
            </p>
            <div className="countdown__tiles" aria-hidden="true">
              {tiles.map((tile) => (
                <Tile key={tile.label} label={tile.label} value={tile.value} animate={!reduced} />
              ))}
            </div>
          </Reveal>
        )}

        {event && (
          <Reveal className="countdown__when" delay={200}>
            <Lotus className="countdown__when-lotus" size={48} color="var(--gold-light)" strokeWidth={1.2} />
            <p className="countdown__date">
              <time dateTime={wedding.weddingDate}><ConfigText value={event.displayDate} /></time>
            </p>
            {event.time && (
              <p className="countdown__time">
                <ConfigText value={event.time} />
                {!isPlaceholder(event.time) && ` ${wedding.timezoneLabel}`}
              </p>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
