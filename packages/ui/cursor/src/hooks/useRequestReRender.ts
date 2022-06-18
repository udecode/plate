import { useCallback, useEffect, useRef, useState } from 'react';

export const useRequestReRender = () => {
  const [, setUpdateCounter] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const requestReRender = useCallback((immediate = false) => {
    if (animationFrameRef.current && !immediate) {
      return;
    }

    if (!immediate) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setUpdateCounter((state) => state + 1);
        animationFrameRef.current = null;
      });
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setUpdateCounter((state) => state + 1);
  }, []);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  });

  useEffect(
    () => () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  return requestReRender;
};
