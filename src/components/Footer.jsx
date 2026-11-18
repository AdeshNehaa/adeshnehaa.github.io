import { ArrowUp, Heart } from 'lucide-react';
import { wedding, isPlaceholder } from '../config/wedding.js';
import ConfigText from './ConfigText.jsx';
import Reveal from './Reveal.jsx';
import { Divider, Mandala } from './Ornament.jsx';
import { Lotus } from './Florals.jsx';
import '../styles/footer.css';

/** First letter of a name, for the monogram (safe for any script; nothing for a [placeholder]). */
const initial = (name) =>
  isPlaceholder(name) ? '' : (Array.from(String(name || '').trim())[0] || '').toUpperCase();

export default function Footer() {
  const { couple, venue, events = [] } = wedding;
  const { groom, bride, hashtag } = couple;
  const ceremony = events.find((event) => event.id === 'wedding') || events[events.length - 1];
  const hasDate = Boolean(ceremony?.displayDate);
  const initials = [initial(groom.name), initial(bride.name)];

  return (
    <footer className="footer">
      <Reveal className="container footer__inner">
        <div className="footer__monogram" aria-hidden="true">
          <Mandala className="footer__ring" size={148} color="var(--gold)" strokeWidth={1} />
          <span className="footer__initials">
            {initials[0] && initials[1] ? (
              <>
                {initials[0]}
                <span className="footer__amp">&amp;</span>
                {initials[1]}
              </>
            ) : (
              <Lotus size={46} color="var(--gold-light)" strokeWidth={1.3} />
            )}
          </span>
        </div>

        <p className="footer__names">
          <ConfigText>{groom.name}</ConfigText> &amp; <ConfigText>{bride.name}</ConfigText>
        </p>
        <p className="footer__meta">
          {hasDate && (
            <time dateTime={ceremony.date}><ConfigText>{ceremony.displayDate}</ConfigText></time>
          )}
          {hasDate && venue.name && <span className="footer__dot" aria-hidden="true">·</span>}
          {venue.name && <span><ConfigText>{venue.name}</ConfigText></span>}
        </p>
        {hashtag && !isPlaceholder(hashtag) && <p className="footer__hashtag">{hashtag}</p>}

        <a className="btn btn--ghost footer__top" href="#home">
          <ArrowUp size={18} strokeWidth={1.5} aria-hidden="true" focusable="false" />
          Back to top
        </a>

        <Divider className="footer__divider" color="var(--gold)" width={180} />
        <p className="footer__made">
          Made with{' '}
          <Heart className="footer__heart" size={14} strokeWidth={1.5} fill="currentColor" aria-hidden="true" focusable="false" />
          <span className="sr-only">love</span>{' '}
          for our family &amp; friends
        </p>
      </Reveal>
    </footer>
  );
}
