import React, { useEffect, useMemo } from 'react';

import { createPrimitiveComponent } from '@udecode/plate/react';

import { ImagePreviewStore, useImagePreviewValue } from '../ImagePreviewStore';
import { useZoom } from '../useZoom';

export const usePreviewImage = () => {
  const currentPreview = useImagePreviewValue('currentPreview');
  const translate = useImagePreviewValue('translate');
  const scale = useImagePreviewValue('scale');
  const imageRef = React.useRef<HTMLImageElement>(null);

  const isZoomIn = useMemo(() => scale <= 1, [scale]);

  const { zoomIn, zoomOut } = useZoom();

  useEffect(() => {
    if (scale <= 1) return;

    const boundingClientRect = imageRef.current?.getBoundingClientRect();

    if (!boundingClientRect) return;

    ImagePreviewStore.set('boundingClientRect', boundingClientRect);
  }, [translate.x, translate.y, scale]);

  return {
    props: {
      draggable: false,
      ref: imageRef,
      src: currentPreview?.url,
      style: {
        cursor: isZoomIn ? 'zoom-in' : 'zoom-out',
        transform: `scale(${scale}) translate(${translate.x + 'px'}, ${translate.y + 'px'})`,
      },
      onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        isZoomIn ? zoomIn() : zoomOut();
      },
    },
  };
};

export const PreviewImage = createPrimitiveComponent('img')({
  propsHook: usePreviewImage,
});
