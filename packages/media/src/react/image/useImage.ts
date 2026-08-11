import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isHotkey } from '@platejs/core';
import { useEditor, useElement } from '@platejs/core/react';

import {
  BaseImagePlugin,
  type ImageElement,
} from '../../lib/image/BaseImagePlugin';
import { ImagePlugin } from '../plugins';
import { ImagePreviewStore, useImagePreviewValue } from './ImageStore';

const zoomLevels = [0, 0.5, 1, 1.5, 2];

export const useZoom = () => {
  const scale = useImagePreviewValue('scale');

  const zoomIn = useCallback(() => {
    if (scale >= 2) return;

    const nextScale = zoomLevels.find((target) => scale < target);

    if (nextScale) ImagePreviewStore.set('scale', nextScale);
  }, [scale]);

  const zoomOut = useCallback(() => {
    if (scale <= 0) return;

    const previousScale = [...zoomLevels]
      .reverse()
      .find((target) => scale > target);

    if (previousScale === 1) {
      ImagePreviewStore.set('translate', { x: 0, y: 0 });
    }
    if (previousScale !== undefined) {
      ImagePreviewStore.set('scale', previousScale);
    }
  }, [scale]);

  return { zoomIn, zoomOut };
};

export const useImage = () => {
  const element = useElement(ImagePlugin);
  const editor = useEditor();
  const key = editor.key(element);

  return {
    props: {
      draggable: true,
      src: element.url,
      onDoubleClickCapture: () => {
        ImagePreviewStore.set('openEditorId', editor.id);
        ImagePreviewStore.set('currentPreview', {
          key,
          url: element.url,
        });
        ImagePreviewStore.set(
          'previewList',
          Array.from(
            editor.read.nodes.entries<ImageElement>({
              at: [],
              match: {
                type: editor.plugin(BaseImagePlugin).schema.type,
              },
            }),
            ([node, path]) => ({
              key: editor.key(path)!,
              url: node.url,
            })
          )
        );
      },
    },
  };
};

export const useScaleInput = () => {
  const scale = useImagePreviewValue('scale');
  const isEditingScale = useImagePreviewValue('isEditingScale');
  const [value, setValue] = useState(`${scale * 100}`);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingScale) return;

    setValue(`${scale * 100}`);

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isEditingScale, scale]);

  return {
    props: {
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isHotkey('enter')(event)) return;

        const nextScale = Math.min(200, Math.max(50, Number(value))) / 100;

        ImagePreviewStore.set('scale', Number(nextScale.toFixed(2)));
        ImagePreviewStore.set('isEditingScale', false);
      },
    },
    ref: inputRef,
  };
};

export const useImagePreview = ({ scrollSpeed }: { scrollSpeed: number }) => {
  const editor = useEditor();
  const isOpen = useImagePreviewValue('isOpen', editor.id);
  const scale = useImagePreviewValue('scale');
  const translate = useImagePreviewValue('translate');
  const boundingClientRect = useImagePreviewValue('boundingClientRect');
  const currentPreview = useImagePreviewValue('currentPreview');
  const previewList = useImagePreviewValue('previewList');

  useEffect(() => {
    const wheel = (event: WheelEvent) => {
      if (scale <= 1 || !boundingClientRect) return;

      const { deltaX, deltaY } = event;
      const { x, y } = translate;
      const { bottom, left, right, top } = boundingClientRect;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let leftOffset = x - deltaX / scrollSpeed;
      let topOffset = y - deltaY / scrollSpeed;

      if (left - deltaX / scrollSpeed > windowWidth / 2 && deltaX < 0) {
        leftOffset = x;
      }
      if (right - deltaX / scrollSpeed < windowWidth / 2 && deltaX > 0) {
        leftOffset = x;
      }
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

    if (!isOpen) return;

    document.addEventListener('wheel', wheel);

    return () => {
      document.removeEventListener('wheel', wheel);
    };
  }, [boundingClientRect, isOpen, scale, scrollSpeed, translate]);

  const { zoomIn, zoomOut } = useZoom();
  const currentPreviewIndex = currentPreview
    ? previewList.findIndex(
        (item) =>
          item.url === currentPreview.url && item.key === currentPreview.key
      )
    : null;
  const onClose = useCallback(() => {
    ImagePreviewStore.actions.close();
  }, []);
  const prevDisabled = currentPreviewIndex === 0;
  const nextDisabled = currentPreviewIndex === previewList.length - 1;
  const zoomOutDisabled = scale <= 0.5;
  const zoomInDisabled = scale >= 2;

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (isHotkey('escape')(event)) {
        event.stopPropagation();
        onClose();
      }
    };

    if (!isOpen) return;

    document.addEventListener('keydown', keydown);

    return () => {
      document.removeEventListener('keydown', keydown);
    };
  }, [isOpen, onClose]);

  return {
    closeProps: {
      onClick: onClose,
    },
    currentUrlIndex: currentPreviewIndex,
    maskLayerProps: {
      onClick: onClose,
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
      onClick: zoomOut,
    },
    zoomInDisabled,
    zoomInProps: {
      disabled: zoomInDisabled,
      onClick: zoomIn,
    },
    zoomOutDisabled,
  };
};

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
      onClick: (event: React.MouseEvent<HTMLImageElement>) => {
        event.stopPropagation();

        if (isZoomIn) {
          zoomIn();
        } else {
          zoomOut();
        }
      },
    },
  };
};
