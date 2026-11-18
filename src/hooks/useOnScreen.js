import { useEffect, useState } from 'react';

/**
 * True while the element is on (or near) the screen.
 * Used to rest ambient animations when their section is out of view.
 *
 *   const live = useOnScreen(ref, { rootMargin: '12% 0px' });
 *
 * `initial` is the value before the first measurement (use true for content
 * that is on screen when the page loads).
 */
export function useOnScreen(ref, { rootMargin = '0px', initial = false } = {}) {
  const [onScreen, setOnScreen] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setOnScreen(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return onScreen;
}
