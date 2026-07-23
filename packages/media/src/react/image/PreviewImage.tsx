import React, { useEffect } from 'react';

import { createPrimitiveComponent } from '@udecode/react-utils';

import { ImagePreviewStore, useImagePreviewValue } from './ImagePreviewStore';
import { useZoom } from './useImagePreview';

export const usePreviewImage = () => {
  const currentPreview = useImagePreviewValue('currentPreview');
  const translate = useImagePreviewValue('translate');
  const scale = useImagePreviewValue('scale');
  const imageRef = React.useRef<HTMLImageElement>(null);

  const isZoomIn = scale <= 1;
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
        transform: `scale(${scale}) translate(${`${translate.x}px`}, ${`${translate.y}px`})`,
      },
      onClick: (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        if (isZoomIn) {
          zoomIn();
        } else {
          zoomOut();
        }
      },
    },
  };
};

export const PreviewImage = createPrimitiveComponent('img')({
  propsHook: usePreviewImage,
});
