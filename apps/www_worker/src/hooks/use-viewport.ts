'use client';

import { useEffect, useState } from 'react';

export const getViewport = () => {
  if (typeof window === 'undefined') {
    return {
      height: 0,
      width: 0,
    };
  }

  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
};

export const useViewport = () => {
  const [viewport, setViewport] = useState(getViewport);

  useEffect(() => {
    const handleResize = () => setViewport(getViewport());
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};
