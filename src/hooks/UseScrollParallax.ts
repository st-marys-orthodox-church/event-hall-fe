import { useEffect, useRef, useState } from 'react';

type Options = {
  speed?: number;
  max?: number;
};

export const useScrollParallax = <T extends HTMLElement = HTMLDivElement>({
  speed = 0.25,
  max = 200,
}: Options = {}) => {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number | null = null;
    let viewportW = 0;
    let viewportH = 0;

    const measureViewport = () => {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight || document.documentElement.clientHeight;
    };

    const update = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportH) return;
      const progress = (viewportH - rect.top) / (viewportH + rect.height);
      const raw = (progress - 0.5) * 2 * speed * rect.height;
      const clamped = Math.max(-max, Math.min(max, raw));
      setOffset(clamped);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    };

    // Mobile browsers fire `resize` with a new innerHeight every time the
    // toolbar collapses or expands mid-scroll. The section itself is sized
    // to the large viewport and does not move, so recomputing against the
    // new height made the image snap. Only a width change (rotation, real
    // resize) should re-measure.
    const onResize = () => {
      if (window.innerWidth === viewportW) return;
      measureViewport();
      onScroll();
    };

    measureViewport();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed, max]);

  return { ref, offset };
};
