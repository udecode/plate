import { useCallback } from 'react';

import { ImagePreviewStore, useImagePreviewValue } from './ImagePreviewStore';

export const useZoom = () => {
  const scale = useImagePreviewValue('scale');

  const zoomIn = useCallback(() => {
    if (scale >= 2) return;

    const targets = [0, 0.5, 1, 1.5, 2];
    const nextScale = targets.find((target) => scale < target);

    nextScale && ImagePreviewStore.set('scale', nextScale);
  }, [scale]);

  const zoomOut = useCallback(() => {
    if (scale <= 0) return;

    const targets = [0, 0.5, 1, 1.5, 2];
    const previousScale = [...targets]
      .reverse()
      .find((target) => scale > target);

    if (previousScale === 1) ImagePreviewStore.set('translate', { x: 0, y: 0 });

    previousScale && ImagePreviewStore.set('scale', previousScale);
  }, [scale]);

  return { zoomIn, zoomOut };
};
