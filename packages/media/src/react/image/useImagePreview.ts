import { useCallback, useEffect, useMemo } from 'react';

import { isHotkey } from '@udecode/plate';
import { useEditorRef } from '@udecode/plate/react';

import { ImagePreviewStore, useImagePreviewValue } from './ImagePreviewStore';
import { useZoom } from './useZoom';

export const useImagePreview = ({ scrollSpeed }: { scrollSpeed: number }) => {
  const editor = useEditorRef();
  const isOpen = useImagePreviewValue('isOpen', editor.id);
  const scale = useImagePreviewValue('scale');
  const translate = useImagePreviewValue('translate');
  const boundingClientRect = useImagePreviewValue('boundingClientRect');
  const currentPreview = useImagePreviewValue('currentPreview');
  const previewList = useImagePreviewValue('previewList');

  // zoom in/out and move image
  useEffect(() => {
    const wheel = (e: WheelEvent) => {
      if (scale <= 1) return;

      const { deltaX, deltaY } = e;
      const { x, y } = translate;

      const { bottom, left, right, top } = boundingClientRect;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let leftOffset = x - deltaX / scrollSpeed;
      let topOffset = y - deltaY / scrollSpeed;

      // Check horizontal scroll boundaries
      if (left - deltaX / scrollSpeed > windowWidth / 2 && deltaX < 0) {
        leftOffset = x;
      }
      if (right - deltaX / scrollSpeed < windowWidth / 2 && deltaX > 0) {
        leftOffset = x;
      }
      // Check the vertical scroll boundary
      if (top - deltaY / scrollSpeed > windowHeight / 2 && deltaY < 0) {
        topOffset = y;
      }
      if (bottom - deltaY / scrollSpeed < windowHeight / 2 && deltaY > 0) {
        topOffset = y;
      }

      ImagePreviewStore.set('translate', {
        x: leftOffset,
        y: topOffset,
      });
    };

    if (!isOpen) return document.removeEventListener('wheel', wheel);

    document.addEventListener('wheel', wheel);

    return () => {
      document.removeEventListener('wheel', wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, translate, scale]);

  const { zoomIn, zoomOut } = useZoom();

  const currentPreviewIndex = useMemo(() => {
    if (!currentPreview) return null;

    return previewList.findIndex(
      (item) => item.url === currentPreview.url && item.id === currentPreview.id
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPreview]);

  const onClose = useCallback(() => {
    ImagePreviewStore.actions.close();
    // document.documentElement.style.overflowY = 'scroll';
  }, []);

  const [prevDisabled, nextDisabled] = useMemo(
    () => [
      currentPreviewIndex === 0,
      currentPreviewIndex === previewList.length - 1,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPreviewIndex]
  );

  const [zoomOutDisabled, zoomInDisabled] = useMemo(
    () => [scale <= 0.5, scale >= 2],
    [scale]
  );

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (isHotkey('escape')(e)) {
        e.stopPropagation();
        onClose();
      }
    };

    if (!isOpen) return document.removeEventListener('keydown', keydown);

    document.addEventListener('keydown', keydown);

    return () => {
      document.removeEventListener('keydown', keydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return {
    closeProps: {
      onClick: () => onClose(),
    },
    currentUrlIndex: currentPreviewIndex,
    maskLayerProps: {
      onClick: () => onClose(),
    },
    nextDisabled,
    nextProps: {
      disabled: nextDisabled,
      onClick: () => {
        if (typeof currentPreviewIndex !== 'number') return;

        ImagePreviewStore.set(
          'currentPreview',
          previewList[currentPreviewIndex + 1]
        );
      },
    },
    prevDisabled,
    prevProps: {
      disabled: prevDisabled,
      onClick: () => {
        if (typeof currentPreviewIndex !== 'number') return;

        ImagePreviewStore.set(
          'currentPreview',
          previewList[currentPreviewIndex - 1]
        );
      },
    },
    scaleTextProps: {
      onClick: () => ImagePreviewStore.set('isEditingScale', true),
    },
    zommOutProps: {
      disabled: zoomOutDisabled,
      onClick: () => zoomOut(),
    },
    zoomInDisabled,
    zoomInProps: {
      disabled: zoomInDisabled,
      onClick: () => zoomIn(),
    },
    zoomOutDisabled,
  };
};
