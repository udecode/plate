import React from 'react';

import { cn } from '@udecode/cn';
import { useEditorRef } from '@udecode/plate-core/react';
import {
  type CursorData,
  CursorOverlay as CursorOverlayPrimitive,
  type CursorOverlayProps,
  type CursorProps,
} from '@udecode/plate-cursor';

import { DragOverCursorPlugin } from '@/lib/plate/demo/plugins/DragOverCursorPlugin';

export function Cursor({
  caretPosition,
  classNames,
  data,
  disableCaret,
  disableSelection,
  selectionRects,
}: CursorProps<CursorData>) {
  const { style, selectionStyle = style } = data ?? {};

  return (
    <>
      {!disableSelection &&
        selectionRects.map((position, i) => (
          <div
            className={cn(
              'pointer-events-none absolute z-10 opacity-30',
              classNames?.selectionRect
            )}
            key={i}
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
  const editor = useEditorRef();
  const dynamicCursors = editor.useOption(DragOverCursorPlugin, 'cursors');

  const allCursors = { ...cursors, ...dynamicCursors };

  return (
    <CursorOverlayPrimitive
      {...props}
      cursors={allCursors}
      onRenderCursor={Cursor}
    />
  );
}
