import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { wedding, isPlaceholder } from '../config/wedding.js';
import ConfigText from '../components/ConfigText.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Reveal from '../components/Reveal.jsx';
import { Corner, Divider, Mandala } from '../components/Ornament.jsx';
import { FloralSpray, Garland, Lotus } from '../components/Florals.jsx';
import '../styles/closing.css';

const ICON = { size: 20, strokeWidth: 1.5, 'aria-hidden': true, focusable: 'false' };

/** "Saturday, 05 December 2026" may wrap after the weekday, but never inside the date itself. */
function DateText({ value }) {
  const comma = typeof value === 'string' && !isPlaceholder(value) ? value.indexOf(',') : -1;
  if (comma < 0) return <ConfigText>{value}</ConfigText>;
  return (
    <>
      {value.slice(0, comma + 1)}{' '}
      <span className="closing__nowrap">{value.slice(comma + 1).trim()}</span>
    </>
  );
}

/** The traditional closing invitation — the last panel of the card. */
export default function Closing() {
  const { couple, messages, venue, events = [] } = wedding;
  const { groom, bride } = couple;
  // the recap shows the wedding ceremony itself
  const ceremony = events.find((event) => event.id === 'wedding') || events[events.length - 1];
  const city = venue.city && !isPlaceholder(venue.city) ? venue.city : '';

  return (
    <section id="blessings" className="section closing" aria-labelledby="blessings-title">
      <Garland className="closing__garland" />
      <Mandala className="closing__halo closing__halo--left" size={560} color="var(--gold-light)" />
      <Mandala className="closing__halo closing__halo--right" size={560} color="var(--gold-light)" />

      <div className="container">
        <div className="closing__card">
          <FloralSpray corner="tl" className="closing__spray closing__spray--tl" />
          <FloralSpray corner="br" className="closing__spray closing__spray--br" />
          <Corner corner="tr" color="var(--gold-light)" className="closing__corner closing__corner--tr" />
          <Corner corner="bl" color="var(--gold-light)" className="closing__corner closing__corner--bl" />

          {messages.closingBlessing && (
            <Reveal as="p" className="closing__blessing deva" lang="sa">
              {messages.closingBlessing}
            </Reveal>
          )}

          <SectionHeading
            light
            id="blessings-title"
            eyebrow="A Heartfelt Invitation"
            title={<ConfigText>{messages.closingTitle}</ConfigText>}
          />

          {messages.closingText && (
            <Reveal as="p" className="closing__text" delay={80}>
              <ConfigText>{messages.closingText}</ConfigText>
            </Reveal>
          )}

          <Reveal className="closing__couple" variant="zoom" delay={120}>
            <Mandala className="closing__medallion" size={400} color="var(--gold-light)" />
            <Lotus className="closing__lotus" size={64} color="var(--gold-light)" strokeWidth={1.2} />
            <p className="closing__names">
              <span className="closing__name"><ConfigText>{groom.name}</ConfigText></span>{' '}
              <span className="closing__amp">&amp;</span>{' '}
              <span className="closing__name"><ConfigText>{bride.name}</ConfigText></span>
            </p>
          </Reveal>

          {ceremony && (
            <Reveal as="dl" className="closing__details" delay={160}>
              <div className="closing__detail">
                <dt>
                  <CalendarDays {...ICON} />
                  Date
                </dt>
                <dd>
                  <time dateTime={ceremony.date}><DateText value={ceremony.displayDate} /></time>
                </dd>
              </div>
              <div className="closing__detail">
                <dt>
                  <Clock {...ICON} />
                  Time
                </dt>
                <dd><ConfigText>{ceremony.time}</ConfigText></dd>
              </div>
              <div className="closing__detail">
                <dt>
                  <MapPin {...ICON} />
                  Venue
                </dt>
                <dd>
                  <ConfigText>{venue.name}</ConfigText>
                  {city && <span className="closing__city">{city}</span>}
                </dd>
              </div>
            </Reveal>
          )}

          <Reveal className="closing__signature" delay={200}>
            <Divider className="closing__divider" color="var(--gold-light)" />
            {messages.closingSignoff && (
              <p className="closing__signoff"><ConfigText>{messages.closingSignoff}</ConfigText></p>
            )}
            {messages.closingFrom && (
              <p className="closing__from"><ConfigText>{messages.closingFrom}</ConfigText></p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
