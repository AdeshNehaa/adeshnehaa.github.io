/** Decorative gold divider: lines with a central lotus/paisley motif. */
export function Divider({ className = '', color = 'var(--gold)', width = 220 }) {
  return (
    <svg className={`ornament-divider ${className}`} width={width} height="28" viewBox="0 0 220 28" aria-hidden="true" focusable="false">
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
        <path d="M4 14h70" />
        <path d="M146 14h70" />
        <path d="M78 14c6-6 12-6 18 0-6 6-12 6-18 0z" />
        <path d="M124 14c6-6 12-6 18 0-6 6-12 6-18 0z" />
        <path d="M110 2c6 6 6 18 0 24-6-6-6-18 0-24z" />
        <path d="M98 14c4-5 8-5 12 0M110 14c4-5 8-5 12 0" />
      </g>
      <g fill={color}>
        <circle cx="74" cy="14" r="1.8" />
        <circle cx="146" cy="14" r="1.8" />
        <circle cx="110" cy="14" r="2.2" />
      </g>
    </svg>
  );
}

/** Corner flourish for frames. Rotate via `corner` = tl | tr | bl | br. */
export function Corner({ corner = 'tl', size = 64, color = 'var(--gold)', className = '' }) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[corner];
  return (
    <svg
      className={`ornament-corner ornament-corner--${corner} ${className}`}
      width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
        <path d="M4 60V20C4 11 11 4 20 4h40" />
        <path d="M10 60V24c0-8 6-14 14-14h36" opacity="0.6" />
        <path d="M18 18c8 0 12 4 12 12-8 0-12-4-12-12z" />
        <path d="M30 18c5-3 10-2 14 2" />
        <path d="M18 30c-3 5-2 10 2 14" />
      </g>
      <circle cx="18" cy="18" r="2" fill={color} />
    </svg>
  );
}

/** Mandala medallion used behind headings and on the welcome screen. */
export function Mandala({ size = 160, color = 'var(--gold)', className = '', strokeWidth = 0.8 }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg className={`ornament-mandala ${className}`} width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g fill="none" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="86" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="30" />
        <circle cx="100" cy="100" r="18" />
        {petals.map((a) => (
          <g key={a} transform={`rotate(${a} 100 100)`}>
            <path d="M100 30c10 14 10 26 0 40-10-14-10-26 0-40z" />
            <path d="M100 8c6 8 6 14 0 20-6-6-6-12 0-20z" />
          </g>
        ))}
      </g>
    </svg>
  );
}
