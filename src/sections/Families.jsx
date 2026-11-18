import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { Corner, Divider, Mandala } from '../components/Ornament.jsx';
import { FloralSpray, Lotus } from '../components/Florals.jsx';
import { wedding, isPlaceholder } from '../config/wedding.js';
import ConfigText from '../components/ConfigText.jsx';
import { keepTitlesTogether } from '../utils/text.js';
import '../styles/families.css';

/**
 * Families — the two families, side by side, clasped by an "&" seal.
 *
 * Everything shown comes from `wedding.families` (and the couple's first names).
 * A value still wrapped in [square brackets] is drawn as an italic note resting on
 * a dotted line — a name waiting to be written in — exactly where the real value
 * will appear once the config is filled in.
 */

const CORNERS = ['tl', 'tr', 'bl', 'br'];

/**
 * One label / value pair, with an optional second line in Marathi (`native`).
 * A placeholder keeps its place in the layout but is clearly marked as pending.
 */
function Detail({ label, value, native, compact = false }) {
  if (!value) return null;
  return (
    <div className={`families__detail${compact ? ' families__detail--compact' : ''}`}>
      <dt className="families__label">{label}</dt>
      <dd className={`families__value${isPlaceholder(value) ? ' families__value--pending' : ''}`}>
        <ConfigText value={keepTitlesTogether(value)} />
        {native && <span className="families__native deva" lang="mr">{native}</span>}
      </dd>
    </div>
  );
}

/** A member line such as "Grandparents: …" — the part before the colon becomes a small label. */
function Member({ text }) {
  const colon = isPlaceholder(text) ? -1 : text.indexOf(':');
  if (colon > 0 && colon < text.length - 1) {
    return (
      <li className="families__member">
        <span className="families__member-label">{text.slice(0, colon).trim()}</span>
        <span className="sr-only">: </span>
        {text.slice(colon + 1).trim()}
      </li>
    );
  }
  return <li className="families__member"><ConfigText value={text} /></li>;
}

function FamilyCard({ side, family, person, variant, sprayCorner, delay }) {
  const titleId = `families-${side}-title`;
  const members = (family.members || []).filter((member) => typeof member === 'string' && member.trim());

  return (
    <Reveal variant={variant} delay={delay} className={`families__slot families__slot--${side}`}>
      <FloralSpray corner={sprayCorner} className={`families__spray families__spray--${sprayCorner}`} />
      <article className="families__card frame" aria-labelledby={titleId}>
        {CORNERS.map((corner) => (
          <Corner key={corner} corner={corner} className={`families__corner families__corner--${corner}`} />
        ))}
        <Lotus size={56} className="families__crest" />
        <h3 id={titleId} className="families__title"><ConfigText value={family.title} /></h3>
        {person?.name && <p className="families__person script"><ConfigText value={person.name} /></p>}
        <Divider className="families__divider" width={150} />
        <dl className="families__details">
          {/* same order as the printed card: grandfather, then parents, then the village */}
          <Detail label="Grandfather" value={family.grandfather} native={family.grandfatherNative} />
          <Detail label="Parents" value={family.parents} native={family.parentsNative} />
          <Detail label="Village" value={family.village} native={family.villageNative} compact />
          <Detail label="Family" value={family.familyName} />
        </dl>
        {members.length > 0 && (
          <ul className="families__members" role="list">
            {members.map((member, index) => <Member key={`${index}-${member}`} text={member} />)}
          </ul>
        )}
      </article>
    </Reveal>
  );
}

export default function Families() {
  const { families, couple, messages } = wedding;

  return (
    <section id="families" className="section section--pattern families" aria-labelledby="families-title">
      <div className="container">
        <SectionHeading id="families-title" eyebrow="With Their Blessings" title="Our Families" />
        {messages.familiesIntro && (
          <Reveal as="p" delay={100} className="lead families__intro">
            <ConfigText value={messages.familiesIntro} />
          </Reveal>
        )}

        <div className="families__grid">
          {families.groom && (
            <FamilyCard side="groom" family={families.groom} person={couple.groom} variant="left" sprayCorner="tl" delay={0} />
          )}

          {families.groom && families.bride && (
            <Reveal variant="zoom" delay={260} className="families__join" aria-hidden="true">
              <span className="families__medal">
                <Mandala size={120} strokeWidth={1.2} className="families__medal-art" />
                <span className="families__amp script">&amp;</span>
              </span>
            </Reveal>
          )}

          {families.bride && (
            <FamilyCard side="bride" family={families.bride} person={couple.bride} variant="right" sprayCorner="tr" delay={140} />
          )}
        </div>
      </div>
    </section>
  );
}
