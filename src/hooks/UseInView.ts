import { useEffect, useRef, useState } from 'react';

type Options = {
  rootMargin?: string;
  threshold?: number;
};

/**
 * Reports once when the element enters the viewport. Resolves immediately when
 * the user prefers reduced motion or IntersectionObserver is unavailable so
 * content is never left hidden.
 */
export const useInView = <T extends HTMLElement = HTMLDivElement>({
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.1,
}: Options = {}) => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
};
