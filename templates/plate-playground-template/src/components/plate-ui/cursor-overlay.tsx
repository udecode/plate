import React from 'react';
import { cn } from '@udecode/cn';
import {
  createPlatePlugin,
  findEventRange,
  useEditorRef,
} from '@udecode/plate-common/react';
import { CursorOverlay as CursorOverlayPrimitive } from '@udecode/plate-cursor';
import { DndPlugin } from '@udecode/plate-dnd';

import type {
  CursorData,
  CursorOverlayProps,
  CursorProps,
  CursorState,
} from '@udecode/plate-cursor';

export function Cursor({
  caretPosition,
  classNames,
  data,
  disableCaret,
  disableSelection,
  selectionRects,
}: CursorProps<CursorData>) {
  const { style, selectionStyle = style } = data ?? ({} as CursorData);

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

export const DragOverCursorPlugin = createPlatePlugin({
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
    onDragLeave: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
    onDragOver: ({ editor, event, plugin }) => {
      if (editor.getOptions(DndPlugin).isDragging) return;

      const range = findEventRange(editor, event);

      if (!range) return;

      editor.setOption(plugin, 'cursors', {
        drag: {
          data: {
            style: {
              backgroundColor: 'hsl(222.2 47.4% 11.2%)',
              width: 3,
            },
          },
          key: 'drag',
          selection: range,
        },
      });
    },
    onDrop: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
  },
  key: 'dragOverCursor',
  options: { cursors: {} as Record<string, CursorState<CursorData>> },
});
