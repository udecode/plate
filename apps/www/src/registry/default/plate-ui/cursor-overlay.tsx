'use client';

import React, { useEffect } from 'react';

import type { PluginConfig } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import {
  type DOMHandler,
  createTPlatePlugin,
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

type CursorOverlayConfig = PluginConfig<
  'cursorOverlay',
  {
    cursors: Record<string, CursorState<CursorData>>;
  }
>;

const getResetCursorsHandler =
  (key: string): DOMHandler<CursorOverlayConfig> =>
  ({ editor, plugin }) => {
    const newCursors = { ...editor.getOptions(plugin).cursors };
    delete newCursors[key];
    console.log(newCursors);

    editor.setOption(plugin, 'cursors', newCursors);
  };

export const CursorOverlayPlugin = createTPlatePlugin<CursorOverlayConfig>({
  key: 'cursorOverlay',
  options: { cursors: {} },
  useHooks: ({ setOption }) => {
    const { editor } = useEditorPlugin(BlockSelectionPlugin);
    const isSelecting = editor.useOption(BlockSelectionPlugin, 'isSelecting');

    useEffect(() => {
      if (isSelecting) {
        setTimeout(() => {
          setOption('cursors', {});
        }, 0);
      }
    }, [isSelecting, setOption]);
  },
  handlers: {
    onBlur: ({ editor, event, setOption }) => {
      if (!editor.selection) return;

      const relatedTarget = event.relatedTarget as HTMLElement;
      const allowOverlay = relatedTarget?.dataset?.plateOverlay === 'true';

      if (!allowOverlay) return;

      setOption('cursors', {
        blur: {
          key: 'blur',
          selection: editor.selection,
        },
      });
    },
    onDragEnd: getResetCursorsHandler('drag'),
    onDragLeave: getResetCursorsHandler('drag'),
    onDragOver: ({ editor, event, setOption }) => {
      if (editor.getOptions(DndPlugin).isDragging) return;

      const range = findEventRange(editor, event);

      if (!range) return;

      setOption('cursors', {
        drag: {
          key: 'drag',
          selection: range,
        },
      });
    },
    onDrop: getResetCursorsHandler('drag'),
    onFocus: getResetCursorsHandler('blur'),
  },
});

export function Cursor({
  id,
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
              'pointer-events-none absolute z-10',
              id === 'blur' && 'bg-brand/25',
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
            id === 'drag' && 'w-px bg-brand',
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
  const dynamicCursors = editor.useOption(CursorOverlayPlugin, 'cursors');

  const allCursors = { ...cursors, ...dynamicCursors };

  return (
    <CursorOverlayPrimitive
      {...props}
      onRenderCursor={Cursor}
      cursors={allCursors}
    />
  );
}
