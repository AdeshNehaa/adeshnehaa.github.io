import Reveal from './Reveal.jsx';
import { Divider } from './Ornament.jsx';

/**
 * Consistent section header: eyebrow · title · optional script subtitle · divider.
 * `native` is an optional Devanagari line above the title; `nativeLang` is its language code.
 * Pass `light` on the maroon bands.
 */
export default function SectionHeading({ id, eyebrow, title, subtitle, native, nativeLang = 'mr', light = false }) {
  return (
    <Reveal className={`section-heading${light ? ' section-heading--light' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {native && <p className="section-heading__native deva" lang={nativeLang}>{native}</p>}
      <h2 id={id} className="section-heading__title">{title}</h2>
      {subtitle && <p className="section-heading__subtitle script">{subtitle}</p>}
      <Divider className="section-heading__divider" />
    </Reveal>
  );
}
