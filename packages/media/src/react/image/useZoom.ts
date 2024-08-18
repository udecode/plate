import { useCallback } from 'react';

import {
  imagePreviewActions,
  useImagePreviewSelectors,
} from './image-preview-store';

export const useZoom = () => {
  const scale = useImagePreviewSelectors().scale();
  const setScale = imagePreviewActions.scale;
  const setTranslate = imagePreviewActions.translate;

  const zoomIn = useCallback(() => {
    if (scale >= 2) return;

    const targets = [0, 0.5, 1, 1.5, 2];
    const nextScale = targets.find((target) => scale < target);

    nextScale && setScale(nextScale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  const zoomOut = useCallback(() => {
    if (scale <= 0) return;

    const targets = [0, 0.5, 1, 1.5, 2];
    const previousScale = [...targets]
      .reverse()
      .find((target) => scale > target);

    if (previousScale === 1) setTranslate({ x: 0, y: 0 });

    previousScale && setScale(previousScale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  return { zoomIn, zoomOut };
};
