import type { ReactNode } from 'react';
import { useInView } from '../../hooks';

type Props = {
  children: ReactNode;
  /** Milliseconds to hold before the entrance starts, for staggered grids. */
  delay?: number;
  variant?: 'fade' | 'fade-up';
  className?: string;
};

/** Plays the entrance animation once the wrapper scrolls into view. */
const Reveal = ({ children, delay = 0, variant = 'fade-up', className = '' }: Props) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const animation = variant === 'fade' ? 'animate-fade-in' : 'animate-fade-up';

  return (
    <div
      ref={ref}
      className={`${className} ${inView ? animation : 'opacity-0'}`.trim()}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export { Reveal };
