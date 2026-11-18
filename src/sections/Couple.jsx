import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { wedding, isPlaceholder, cleanPlaceholder } from '../config/wedding.js';
import ConfigText from '../components/ConfigText.jsx';
import SongCard from '../components/SongCard.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Mandala } from '../components/Ornament.jsx';
import { FloralSpray, Lotus } from '../components/Florals.jsx';
import { asset } from '../utils/links.js';
import '../styles/couple.css';

/*
 * Cusped mehrab arch, drawn once in a 320 × 440 box and used twice:
 * as the clip-path of the portrait window and as the path of the gold frame.
 */
const ARCH_W = 320;
const ARCH_H = 440;
const ARCH =
  'M26 414V214H40A34 34 0 0 1 48 156A30 30 0 0 1 76 112A28 28 0 0 1 116 78' +
  'C118 56 150 48 160 26C170 48 202 56 204 78' +
  'A28 28 0 0 1 244 112A30 30 0 0 1 272 156A34 34 0 0 1 280 214H294V414Z';

// Set inline (not in the stylesheet) so the #fragment always resolves against this document.
const ARCH_CLIP = { clipPath: 'url(#couple-arch-clip)', WebkitClipPath: 'url(#couple-arch-clip)' };

/** A config value without its [placeholder] brackets. */
const plain = (value) => (isPlaceholder(value) ? cleanPlaceholder(value) : value);

/** Rough width, in em, of a name set in the script face — lets the CSS keep unusually long names inside their column. */
const scriptEm = (name = '') => 0.7 + 0.36 * Array.from(name).length;

/** Shared <defs>: the arch scaled to a 1 × 1 box for clipping, and the gold gradient of the frame. */
function ArchDefs() {
  return (
    <svg className="couple__defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="couple-arch-clip" clipPathUnits="objectBoundingBox">
          <path d={ARCH} transform={`scale(${1 / ARCH_W} ${1 / ARCH_H})`} />
        </clipPath>
        <linearGradient id="couple-arch-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold)" />
          <stop offset="0.5" stopColor="var(--gold-deep)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Gold line-art frame that sits over the portrait window. */
function ArchFrame() {
  return (
    <svg className="couple__arch" viewBox={`0 0 ${ARCH_W} ${ARCH_H}`} aria-hidden="true" focusable="false">
      {/* Architrave: three stacked strokes leave two gold lines with a row of beads between them. */}
      <g fill="none" strokeLinejoin="round">
        <path d={ARCH} stroke="url(#couple-arch-gold)" strokeWidth="16.5" />
        <path d={ARCH} stroke="var(--ivory)" strokeWidth="12.6" />
        <path d={ARCH} stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.01 7.2" />
      </g>
      {/* Capitals where the arch springs from the jambs, and a stepped plinth. */}
      <g fill="var(--ivory)" stroke="var(--gold-deep)" strokeWidth="1.2">
        <rect x="13" y="208" width="36" height="11" rx="3" />
        <rect x="271" y="208" width="36" height="11" rx="3" />
        <rect x="11" y="406" width="298" height="13" rx="3" />
        <rect x="3" y="421" width="314" height="10" rx="3" />
      </g>
      <path d="M22 412.5H298" fill="none" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.01 7.2" />
      {/* Lotus-bud finial */}
      <g fill="var(--gold)" stroke="var(--gold-deep)" strokeWidth="0.8" strokeLinejoin="round">
        <path d="M160 20C150 19 144 14 142 7C150 8 157 12 160 20Z" />
        <path d="M160 20C170 19 176 14 178 7C170 8 163 12 160 20Z" />
        <path d="M160 1C166 8 166 14 160 21C154 14 154 8 160 1Z" />
      </g>
    </svg>
  );
}

/** One portrait in its arch, with the name and role beneath. */
function Person({ side, person, variant, delay = 0 }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(person.photo) && !failed;
  const name = plain(person.name) ?? '';
  const initial = isPlaceholder(person.name) ? '' : Array.from(name.trim())[0] ?? '';

  return (
    <figure className={`couple__person couple__person--${side}`}>
      <Reveal className={`couple__portrait couple__portrait--${side}`} variant={variant} delay={delay}>
        <div className="couple__window" style={ARCH_CLIP}>
          {showPhoto ? (
            <img
              className="couple__photo"
              src={asset(person.photo)}
              alt={`Portrait of ${name}`}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="couple__placeholder">
              <Mandala className="couple__placeholder-mandala" size={260} strokeWidth={0.7} />
              {initial && <span className="couple__initial script" aria-hidden="true">{initial}</span>}
              <span className="couple__placeholder-label placeholder-text">
                <ImagePlus size={15} strokeWidth={1.5} aria-hidden="true" />
                Photo to be added
              </span>
            </div>
          )}
        </div>
        <ArchFrame />
        {/* a small bouquet at the outer foot of each arch */}
        <FloralSpray corner={side === 'groom' ? 'bl' : 'br'} className="couple__flowers" />
      </Reveal>
      <Reveal as="figcaption" className={`couple__caption couple__caption--${side}`} delay={delay + 180}>
        <h3 className="couple__name script"><ConfigText value={person.name} /></h3>
        {person.role && <p className="couple__role"><ConfigText value={person.role} /></p>}
      </Reveal>
    </figure>
  );
}

/** Couple — the two portraits, joined by an ornament, and a short introduction. */
export default function Couple({ opened = true }) {
  const { couple, messages } = wedding;
  const intro = messages.introText;
  const nameFit = {
    '--couple-name-em': Math.max(scriptEm(plain(couple.groom.name)), scriptEm(plain(couple.bride.name))).toFixed(2),
  };

  return (
    <section id="couple" className="section section--pattern couple" aria-labelledby="couple-title">
      <ArchDefs />
      <div className="container">
        <SectionHeading id="couple-title" eyebrow="Meet the Couple" title="The Bride & Groom" />

        <div className="couple__pair" style={nameFit}>
          <Person side="groom" person={couple.groom} variant="left" />
          <Reveal className="couple__joiner" variant="zoom" delay={320} aria-hidden="true">
            <Lotus className="couple__joiner-lotus" size={58} strokeWidth={1.3} />
            <span className="couple__amp">
              <span className="couple__amp-glyph script">&amp;</span>
            </span>
            <span className="couple__joiner-drop" />
          </Reveal>
          <Person side="bride" person={couple.bride} variant="right" delay={120} />
        </div>

        {(intro || couple.hashtag) && (
          <Reveal className="couple__intro" delay={120}>
            {intro && (
              <p className={`couple__intro-text lead${isPlaceholder(intro) ? ' placeholder-text' : ''}`}>{plain(intro)}</p>
            )}
            {couple.hashtag && <p className="couple__hashtag">{couple.hashtag}</p>}
          </Reveal>
        )}

        {/* "Our Song": shown only when a YouTube link is set in wedding.music */}
        <SongCard opened={opened} />
      </div>
    </section>
  );
}
