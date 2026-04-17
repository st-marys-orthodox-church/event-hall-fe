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

    const update = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
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

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed, max]);

  return { ref, offset };
};
