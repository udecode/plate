import { useState, useEffect } from 'react';

export const getViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const useViewport = () => {
  const [viewport, setViewport] = useState(getViewport);

  useEffect(() => {
    const handleResize = () => setViewport(getViewport());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};
