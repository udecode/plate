'use client';

import React, { useEffect } from 'react';

import { cn } from '@udecode/cn';
import {
  createPlatePlugin,
  findEventRange,
  useEditorPlugin,
  useEditorRef,
} from '@udecode/plate-common/react';
import {
  type CursorData,
  type CursorOverlayProps,
  type CursorProps,
  type CursorState,
  CursorOverlay as CursorOverlayPrimitive,
} from '@udecode/plate-cursor';
import { DndPlugin } from '@udecode/plate-dnd';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

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
            key={i}
            className={cn(
              'pointer-events-none absolute z-10 opacity-30',
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
  const editor = useEditorRef();
  const dynamicCursors = editor.useOption(DragOverCursorPlugin, 'cursors');

  const allCursors = { ...cursors, ...dynamicCursors };

  return (
    <CursorOverlayPrimitive
      {...props}
      onRenderCursor={Cursor}
      cursors={allCursors}
    />
  );
}

const DragOverCursorPlugin = createPlatePlugin({
  key: 'dragOverCursor',
  options: { cursors: {} as Record<string, CursorState<CursorData>> },
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
          key: 'drag',
          data: {
            style: {
              backgroundColor: 'hsl(222.2 47.4% 11.2%)',
              width: 3,
            },
          },
          selection: range,
        },
      });
    },
    onDrop: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
  },
});

export const SelectionOverlayPlugin = createPlatePlugin({
  key: 'selection_over_lay',
  useHooks: () => {
    const { editor } = useEditorPlugin(BlockSelectionPlugin);
    const isSelecting = editor.useOptions(BlockSelectionPlugin).isSelecting;

    useEffect(() => {
      if (isSelecting) {
        setTimeout(() => {
          editor.setOption(DragOverCursorPlugin, 'cursors', {});
        }, 0);
      }
    }, [editor, isSelecting]);
  },
  handlers: {
    onBlur: ({ editor, event }) => {
      const isPrevented =
        (event.relatedTarget as HTMLElement)?.dataset?.platePreventOverlay ===
        'true';

      if (isPrevented) return;
      if (editor.selection) {
        editor.setOption(DragOverCursorPlugin, 'cursors', {
          drag: {
            key: 'blur',
            data: {
              selectionStyle: {
                backgroundColor: 'rgba(47, 121, 216, 0.35)',
              },
            },
            selection: editor.selection,
          },
        });
      }
    },
    onFocus: ({ editor }) => {
      editor.setOption(DragOverCursorPlugin, 'cursors', {});
    },
  },
});
