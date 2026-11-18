import { useInView } from '../hooks/useInView.js';

/**
 * Scroll-triggered reveal wrapper.
 * <Reveal variant="up|left|right|zoom" delay={120} as="div">…</Reveal>
 */
export default function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', style, children, ...rest }) {
  const [ref, inView] = useInView();
  const variantClass = variant === 'up' ? '' : ` reveal--${variant}`;
  return (
    <Tag
      ref={ref}
      className={`reveal${variantClass}${inView ? ' is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
