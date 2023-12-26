import React from 'react';

export const useRequestReRender = () => {
  const [, setUpdateCounter] = React.useState(0);
  const animationFrameRef = React.useRef<number | null>(null);

  const requestReRender = React.useCallback((immediate = false) => {
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

  React.useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  });

  React.useEffect(
    () => () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  return requestReRender;
};
