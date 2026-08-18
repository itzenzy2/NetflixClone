/**
 * useParallax hook
 *
 * Translates an element vertically as the page scrolls, giving hero
 * backdrops a slow cinematic parallax. The element moves at a fraction of
 * the scroll speed (`speed`), only while it is near the top of the viewport.
 *
 * The transform is applied directly to the DOM node (rAF-throttled) so no
 * React re-render happens per scroll event. Disabled for reduced motion.
 */

import { useEffect } from 'react';

export default function useParallax(ref, speed = 0.22) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = null;

    const update = () => {
      raf = null;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.1) return;
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, speed]);
}
