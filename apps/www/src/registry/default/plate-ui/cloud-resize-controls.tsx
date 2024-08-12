'use client';

import React, {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react';

import { resizeInWidth } from '@portive/client';
import {
  CloudImagePlugin,
  type TCloudImageElement,
} from '@udecode/plate-cloud';
import { setNodes } from '@udecode/plate-common';
import { findNodePath, useEditorRef } from '@udecode/plate-common/react';
import { getPluginOptions } from '@udecode/plate-core';

type ImageSize = { height: number; width: number };

type SetImageSize = Dispatch<SetStateAction<ImageSize>>;

/** The resize label that shows the width/height of the image */
function ResizeLabel({ size }: { size: { height: number; width: number } }) {
  const isBelow = size.width < 100 || size.height < 100;
  const bottom = isBelow ? -24 : 4;

  return (
    <div
      style={{
        background: '#404040',
        borderRadius: 3,
        bottom,
        boxShadow: '0px 0px 2px 1px rgba(255, 255, 255, 0.5)',
        color: 'white',
        font: '10px/20px sans-serif',
        left: 4,
        minWidth: 50,
        padding: '0 7px',
        position: 'absolute',
        textAlign: 'center',
        transition: 'bottom 250ms',
        zIndex: 100,
      }}
    >
      {size.width} &times; {size.height}
    </div>
  );
}

/** The little divets on the resize handle bar. */
const barStyle = {
  background: 'rgba(255,255,255,0.75)',
  height: 16,
  position: 'absolute',
  top: 8,
  width: 1,
} as const;

/** The handle used to drag resize an image */
function ResizeHandles({
  onMouseDown,
}: {
  onMouseDown: React.MouseEventHandler;
}) {
  return (
    <>
      {/* Invisible Handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          background: 'rgba(127,127,127,0.01)',
          bottom: 0,
          cursor: 'ew-resize',
          position: 'absolute',
          right: -8,
          top: 0,
          width: 16,
        }}
      >
        {/* Visible Handle */}
        <div
          style={{
            background: 'DodgerBlue',
            borderRadius: 4,
            height: 32,
            left: 0,
            marginTop: -16,
            position: 'absolute',
            top: '50%',
            width: 16,
          }}
        >
          <div style={{ ...barStyle, left: 3.5 }} />
          <div style={{ ...barStyle, left: 7.5 }} />
          <div style={{ ...barStyle, left: 11.5 }} />
        </div>
      </div>
    </>
  );
}

export function ResizeControls({
  element,
  setSize,
  size,
}: {
  element: TCloudImageElement;
  setSize: SetImageSize;
  size: ImageSize;
}) {
  const editor = useEditorRef();
  const [isResizing, setIsResizing] = useState(false);

  const { maxResizeWidth, minResizeWidth } = getPluginOptions(
    editor,
    CloudImagePlugin
  );

  const currentSizeRef = useRef<{ height: number; width: number }>();

  const onMouseDown = useCallback(
    (mouseDownEvent: React.MouseEvent) => {
      setIsResizing(true);
      const startX = mouseDownEvent.clientX;
      const startWidth = size.width;
      const minWidth = minResizeWidth;
      const maxWidth = Math.min(element.maxWidth, maxResizeWidth);

      /**
       * Handle resize dragging through an event handler on mouseMove on the
       * document.
       */
      function onDocumentMouseMove(mouseMoveEvent: MouseEvent) {
        mouseMoveEvent.preventDefault();
        mouseMoveEvent.stopPropagation();
        /** Calculate the proposed width based on drag position */
        const proposedWidth = startWidth + mouseMoveEvent.clientX - startX;

        /** Constrain the proposed with between min, max and original width */
        const nextWidth = Math.min(maxWidth, Math.max(minWidth, proposedWidth));

        const currentSize = resizeInWidth(
          { height: element.maxHeight, width: element.maxWidth },
          nextWidth
        );

        currentSizeRef.current = currentSize;
        setSize(currentSize);
      }

      const originalCursor = document.body.style.cursor;

      /** When the user releases the mouse, remove all the event handlers */
      function onDocumentMouseUp() {
        setIsResizing(false);
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mouseup', onDocumentMouseUp);
        document.body.style.cursor = originalCursor;

        const at = findNodePath(editor, element);

        if (!currentSizeRef.current) return;

        setNodes<TCloudImageElement>(editor, currentSizeRef.current, { at });
      }

      /** Attach document event listeners */
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', onDocumentMouseUp);

      /**
       * While dragging, we want the cursor to be `ew-resize` (left-right arrow)
       * even if the cursor happens to not be exactly on the handle at the
       * moment due to a delay in the cursor moving to a location and the image
       * resizing to it.
       *
       * Also, image has max width/height and the cursor can fall outside of it.
       */
      document.body.style.cursor = 'ew-resize';
    },
    [size.width, minResizeWidth, element, maxResizeWidth, setSize, editor]
  );

  if (element.width < minResizeWidth) return null;

  return (
    <>
      {isResizing ? <ResizeLabel size={size} /> : null}
      <ResizeHandles onMouseDown={onMouseDown} />
    </>
  );
}
