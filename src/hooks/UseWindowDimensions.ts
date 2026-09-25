import React from 'react';

// Fires synchronously before paint on client; falls back to useEffect on server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export const useWindowSize = () => {
  const breakpoint = 1024;
  const [windowSize, setWindowSize] = React.useState({
    width: 0,
    height: 0,
  });

  useIsomorphicLayoutEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, breakpoint, isMobile: windowSize.width < breakpoint };
};
