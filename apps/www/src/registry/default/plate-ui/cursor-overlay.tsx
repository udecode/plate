import React from 'react';
import { createZustoodStore } from '@udecode/plate-common';
import {
  CursorData,
  CursorOverlay as CursorOverlayPrimitive,
  CursorOverlayProps,
  CursorProps,
} from '@udecode/plate-cursor';

import { cn } from '@/lib/utils';

export const cursorStore = createZustoodStore('cursor')({
  cursors: {},
});

export function Cursor({
  data,
  selectionRects,
  caretPosition,
  disableCaret,
  disableSelection,
  classNames,
}: CursorProps<CursorData>) {
  if (!data) {
    return null;
  }

  const { style, selectionStyle = style } = data;

  return (
    <>
      {!disableSelection &&
        selectionRects.map((position, i) => (
          <div
            key={i}
            className={cn(
              'pointer-events-none absolute z-10 opacity-[0.3]',
              classNames?.selectionRect
            )}
            style={{
              ...selectionStyle,
              ...position,
            }}
          />
        ))}
      {!disableCaret && caretPosition && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-0.5',
            classNames?.caret
          )}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}

export function CursorOverlay({ cursors, ...props }: CursorOverlayProps) {
  const dynamicCursors = cursorStore.use.cursors();

  const allCursors = { ...cursors, ...dynamicCursors };

  return (
    <CursorOverlayPrimitive
      {...props}
      cursors={allCursors}
      onRenderCursor={Cursor}
    />
  );
}
