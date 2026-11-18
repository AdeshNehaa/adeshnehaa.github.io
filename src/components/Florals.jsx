import { useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import '../styles/florals.css';

/**
 * Shared floral artwork — all drawn as inline SVG (no image files).
 *   <Marigold />      marigold flower head (Haldi accents)
 *   <Blossom />       stylised blossom: tone = maroon | blush | gold | ivory
 *   <FloralSpray />   corner bouquet: corner = tl | tr | bl | br
 *   <Garland />       marigold + mango-leaf toran, spans the full width
 *   <Lotus />         gold line-art lotus
 *   <FallingPetals /> gentle petal shower (renders nothing for reduced motion)
 */

const ring = (count, render, offset = 0) =>
  Array.from({ length: count }, (_, i) => render((360 / count) * i + offset, i));

/* ───────── Marigold ───────── */
function MarigoldShape() {
  return (
    <g stroke="#c96a08" strokeOpacity="0.45" strokeWidth="0.6">
      {ring(16, (a) => <ellipse key={`a${a}`} cx="0" cy="-30" rx="7.5" ry="10" fill="#e9790b" transform={`rotate(${a})`} />)}
      {ring(14, (a) => <ellipse key={`b${a}`} cx="0" cy="-22" rx="7" ry="9" fill="#f28c0f" transform={`rotate(${a})`} />, 12)}
      {ring(10, (a) => <ellipse key={`c${a}`} cx="0" cy="-14" rx="6" ry="7.5" fill="#f5a20e" transform={`rotate(${a})`} />, 6)}
      {ring(7, (a) => <ellipse key={`d${a}`} cx="0" cy="-7" rx="4.6" ry="5.6" fill="#f7b90f" transform={`rotate(${a})`} />, 20)}
      <circle r="4.2" fill="#f9cf4a" />
    </g>
  );
}

export function Marigold({ size = 64, className = '' }) {
  return (
    <svg className={`floral floral-marigold ${className}`} width={size} height={size} viewBox="-42 -42 84 84" aria-hidden="true" focusable="false">
      <MarigoldShape />
    </svg>
  );
}

/* ───────── Blossom ───────── */
const BLOSSOM_TONES = {
  maroon: { outer: '#7a1f2b', inner: '#9c3a45', core: '#e6cf98', line: '#5a1320' },
  blush: { outer: '#e8bfb3', inner: '#f4dcd3', core: '#c9a45c', line: '#c48f80' },
  gold: { outer: '#d4b06a', inner: '#ecd9a8', core: '#7a1f2b', line: '#a8823a' },
  ivory: { outer: '#f7eedb', inner: '#fdf8ef', core: '#c9a45c', line: '#c9a45c' },
};

function BlossomShape({ tone = 'maroon' }) {
  const t = BLOSSOM_TONES[tone] || BLOSSOM_TONES.maroon;
  return (
    <g stroke={t.line} strokeOpacity="0.5" strokeWidth="0.7">
      {ring(6, (a) => <path key={`o${a}`} d="M0 -4C14 -12 16 -30 0 -38C-16 -30 -14 -12 0 -4Z" fill={t.outer} transform={`rotate(${a})`} />)}
      {ring(6, (a) => <path key={`i${a}`} d="M0 -3C9 -9 10 -20 0 -26C-10 -20 -9 -9 0 -3Z" fill={t.inner} transform={`rotate(${a})`} />, 30)}
      <circle r="6" fill={t.core} />
      {ring(8, (a) => <circle key={`d${a}`} cx="0" cy="-9.5" r="1.1" fill={t.core} stroke="none" transform={`rotate(${a})`} />)}
    </g>
  );
}

export function Blossom({ size = 64, tone = 'maroon', className = '' }) {
  return (
    <svg className={`floral floral-blossom ${className}`} width={size} height={size} viewBox="-40 -40 80 80" aria-hidden="true" focusable="false">
      <BlossomShape tone={tone} />
    </svg>
  );
}

/* ───────── Leaf + bud (building blocks) ───────── */
function Leaf({ x = 0, y = 0, r = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C9 -10 9 -26 0 -36C-9 -26 -9 -10 0 0Z" fill="var(--leaf)" stroke="var(--leaf-deep)" strokeWidth="0.7" strokeOpacity="0.6" />
      <path d="M0 -2V-31" fill="none" stroke="var(--leaf-deep)" strokeWidth="0.6" strokeOpacity="0.6" />
    </g>
  );
}

function Bud({ x, y, r = 0, s = 1, fill = 'var(--maroon-soft)' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C7 -6 7 -15 0 -22C-7 -15 -7 -6 0 0Z" fill={fill} />
      <path d="M-5 -3C-3 -7 3 -7 5 -3C2 1 -2 1 -5 -3Z" fill="var(--leaf-deep)" />
    </g>
  );
}

/* ───────── Corner bouquet ───────── */
const SPRAY_FLIP = { tl: 'none', tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1, -1)' };

export function FloralSpray({ corner = 'tl', size = 220, className = '' }) {
  return (
    <svg
      className={`floral floral-spray floral-spray--${corner} ${className}`}
      width={size} height={size} viewBox="0 0 260 260"
      style={{ transform: SPRAY_FLIP[corner] }} aria-hidden="true" focusable="false"
    >
      <g fill="none" stroke="var(--leaf-deep)" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7">
        <path d="M40 40C90 30 150 32 230 22" />
        <path d="M40 40C30 90 32 150 22 230" />
        <path d="M40 40C80 70 122 112 162 170" />
        <path d="M118 33C140 50 160 60 188 66" />
        <path d="M33 118C50 140 60 160 66 188" />
      </g>

      {/* leaves along the top stem */}
      <Leaf x={104} y={33} r={52} s={0.82} />
      <Leaf x={104} y={33} r={128} s={0.82} />
      <Leaf x={152} y={30} r={58} s={0.74} />
      <Leaf x={152} y={30} r={122} s={0.74} />
      <Leaf x={200} y={25} r={68} s={0.62} />
      <Leaf x={200} y={25} r={116} s={0.62} />
      {/* leaves along the side stem */}
      <Leaf x={33} y={104} r={218} s={0.82} />
      <Leaf x={33} y={104} r={142} s={0.82} />
      <Leaf x={30} y={152} r={212} s={0.74} />
      <Leaf x={30} y={152} r={148} s={0.74} />
      <Leaf x={25} y={200} r={202} s={0.62} />
      <Leaf x={25} y={200} r={154} s={0.62} />
      {/* leaves along the diagonal stem */}
      <Leaf x={102} y={90} r={98} s={0.8} />
      <Leaf x={102} y={90} r={172} s={0.8} />
      <Leaf x={136} y={132} r={104} s={0.68} />
      <Leaf x={136} y={132} r={166} s={0.68} />

      {/* buds at the stem tips */}
      <Bud x={230} y={22} r={96} s={0.9} />
      <Bud x={22} y={230} r={174} s={0.9} />
      <Bud x={162} y={170} r={146} s={0.9} fill="var(--gold)" />

      {/* flowers */}
      <g transform="translate(188 66) scale(0.44)"><MarigoldShape /></g>
      <g transform="translate(66 188) scale(0.44)"><MarigoldShape /></g>
      <g transform="translate(130 72) scale(0.6) rotate(12)"><BlossomShape tone="blush" /></g>
      <g transform="translate(72 130) scale(0.6) rotate(-8)"><BlossomShape tone="gold" /></g>
      <g transform="translate(60 60) rotate(15)"><BlossomShape tone="maroon" /></g>

      <g fill="var(--gold)">
        <circle cx="172" cy="104" r="2.2" />
        <circle cx="104" cy="172" r="2.2" />
        <circle cx="212" cy="50" r="1.8" />
        <circle cx="50" cy="212" r="1.8" />
        <circle cx="190" cy="134" r="1.6" />
        <circle cx="134" cy="190" r="1.6" />
        <circle cx="236" cy="42" r="1.4" />
        <circle cx="42" cy="236" r="1.4" />
      </g>
    </svg>
  );
}

/* ───────── Marigold toran / garland ───────── */
function Bead({ x, y, r, alt }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={alt ? '#f5a20e' : '#ee820c'} stroke="#c96a08" strokeOpacity="0.5" strokeWidth="0.6" />
      <circle cx={x} cy={y} r={r * 0.52} fill={alt ? '#f9c62f' : '#f5a20e'} />
    </g>
  );
}

export function Garland({ swags = 18, className = '' }) {
  const W = 120;
  const total = swags * W;
  const parts = useMemo(() => {
    const leaves = [];
    const beads = [];
    for (let s = 0; s <= swags; s += 1) {
      const x = s * W;
      // hanging strand + mango leaves at every junction
      leaves.push({ x, y: 54, r: 158, s: 0.9 }, { x, y: 54, r: 202, s: 0.9 }, { x, y: 56, r: 180, s: 1.05 });
      for (let j = 0; j < 4; j += 1) beads.push({ x, y: 9 + j * 12.5, r: 6.8, alt: (j + s) % 2 });
      if (s === swags) break;
      // the swag between two junctions
      for (let i = 1; i < 9; i += 1) {
        const t = i / 9;
        beads.push({ x: x + t * W, y: 7 + 112 * t * (1 - t), r: 6.2, alt: i % 2 });
      }
      // small pendant at the lowest point of the swag
      beads.push({ x: x + W / 2, y: 47, r: 5.2, alt: 1 }, { x: x + W / 2, y: 57, r: 4.4, alt: 0 });
    }
    return { leaves, beads };
  }, [swags]);

  return (
    <svg
      className={`floral floral-garland ${className}`}
      viewBox={`0 0 ${total} 100`} preserveAspectRatio="xMidYMin slice"
      aria-hidden="true" focusable="false"
    >
      <path d={`M0 4H${total}`} stroke="var(--gold-deep)" strokeWidth="2" />
      {parts.leaves.map((l, i) => <Leaf key={`l${i}`} {...l} />)}
      {parts.beads.map((b, i) => <Bead key={`b${i}`} {...b} />)}
    </svg>
  );
}

/* ───────── Lotus (line art) ───────── */
export function Lotus({ size = 72, color = 'var(--gold)', className = '', strokeWidth = 1.4 }) {
  return (
    <svg className={`floral floral-lotus ${className}`} width={size} height={size * 0.76} viewBox="0 0 100 76" aria-hidden="true" focusable="false">
      <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 60C32 62 16 54 8 40C24 38 40 46 50 60Z" />
        <path d="M50 60C68 62 84 54 92 40C76 38 60 46 50 60Z" />
        <path d="M50 60C36 54 26 40 26 24C40 30 48 44 50 60Z" />
        <path d="M50 60C64 54 74 40 74 24C60 30 52 44 50 60Z" />
        <path d="M50 10C62 28 62 46 50 60C38 46 38 28 50 10Z" />
        <path d="M22 68C36 74 64 74 78 68" />
      </g>
    </svg>
  );
}

/* ───────── Falling petals ───────── */
export function FallingPetals({ count = 14, className = '' }) {
  const reduced = useReducedMotion();
  // Deterministic "random" values so the shower is stable between renders.
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37 + 11) % 100,
        delay: -((i * 1.7) % 12),
        duration: 11 + ((i * 3) % 8),
        size: 9 + ((i * 5) % 9),
        tone: i % 3,
      })),
    [count]
  );
  if (reduced) return null;
  return (
    <div className={`petals ${className}`} aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className={`petals__petal petals__petal--${p.tone}`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
