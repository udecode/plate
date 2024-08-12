import { useCallback, useEffect, useMemo } from 'react';

import { isHotkey } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-common/react';

import {
  imagePreviewActions,
  useImagePreviewSelectors,
} from '../image-preview-store';
import { useZoom } from './useZoom';

export const useImagePreviewState = ({
  scrollSpeed,
}: {
  scrollSpeed: number;
}) => {
  const editor = useEditorRef();
  const isOpen = useImagePreviewSelectors().isOpen(editor.id);
  const scale = useImagePreviewSelectors().scale();
  const translate = useImagePreviewSelectors().translate();
  const setTranslate = imagePreviewActions.translate;
  const boundingClientRect = useImagePreviewSelectors().boundingClientRect();
  const currentPreview = useImagePreviewSelectors().currentPreview();
  const setCurrentPreView = imagePreviewActions.currentPreview;
  const previewList = useImagePreviewSelectors().previewList();
  const isEditingScale = useImagePreviewSelectors().isEditingScale();
  const setIsEditingScale = imagePreviewActions.isEditingScale;

  return {
    boundingClientRect,
    currentPreview,
    editor,
    isEditingScale,
    isOpen,
    previewList,
    scale,
    scrollSpeed,
    setCurrentPreView,
    setIsEditingScale,
    setTranslate,
    translate,
  };
};

export const useImagePreview = ({
  boundingClientRect,
  currentPreview,
  isOpen,
  previewList,
  scale,
  scrollSpeed,
  setCurrentPreView,
  setIsEditingScale,
  setTranslate,
  translate,
}: ReturnType<typeof useImagePreviewState>) => {
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

      setTranslate({
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
    imagePreviewActions.close();
    document.documentElement.style.overflowY = 'scroll';
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

        setCurrentPreView(previewList[currentPreviewIndex + 1]);
      },
    },
    prevDisabled,
    prevProps: {
      disabled: prevDisabled,
      onClick: () => {
        if (typeof currentPreviewIndex !== 'number') return;

        setCurrentPreView(previewList[currentPreviewIndex - 1]);
      },
    },
    scaleTextProps: {
      onClick: () => setIsEditingScale(true),
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
