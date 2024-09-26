import React, { useEffect, useMemo } from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common/react';

import {
  imagePreviewActions,
  useImagePreviewSelectors,
} from '../ImagePreviewStore';
import { useZoom } from '../useZoom';

export const usePreviewImageState = () => {
  const currentPreview = useImagePreviewSelectors().currentPreview();
  const translate = useImagePreviewSelectors().translate();
  const scale = useImagePreviewSelectors().scale();
  const imageRef = React.useRef<HTMLImageElement>(null);
  const setBoundingClientRect = imagePreviewActions.boundingClientRect;

  return {
    currentPreview,
    imageRef,
    scale,
    setBoundingClientRect,
    translate,
  };
};

export const usePreviewImage = ({
  currentPreview,
  imageRef,
  scale,
  setBoundingClientRect,
  translate,
}: ReturnType<typeof usePreviewImageState>) => {
  const isZoomIn = useMemo(() => scale <= 1, [scale]);

  const { zoomIn, zoomOut } = useZoom();

  useEffect(() => {
    if (scale <= 1) return;

    const boundingClientRect = imageRef.current?.getBoundingClientRect();

    if (!boundingClientRect) return;

    setBoundingClientRect(boundingClientRect);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  stateHook: usePreviewImageState,
});
