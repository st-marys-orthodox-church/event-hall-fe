import { useEffect, useState } from 'react';

/**
 * True once the page has scrolled past `threshold` pixels. State only changes
 * when the threshold is crossed, so consumers do not re-render on every
 * scroll tick.
 */
export const useScrolledPast = (threshold: number) => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    const check = () => {
      rafId = null;
      setPast(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  return past;
};
