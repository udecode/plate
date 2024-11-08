'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { isCollapsed } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-common/react';
import {
  type CursorData,
  type CursorOverlayProps,
  type CursorProps,
  CursorOverlayPlugin,
  CursorOverlay as CursorOverlayPrimitive,
} from '@udecode/plate-selection/react';

export function Cursor({
  id,
  caretPosition,
  classNames,
  data,
  disableCaret,
  disableSelection,
  selection,
  selectionRects,
}: CursorProps<CursorData>) {
  const { style, selectionStyle = style } = data ?? ({} as CursorData);
  const isCursor = isCollapsed(selection);

  return (
    <>
      {!disableSelection &&
        selectionRects.map((position, i) => {
          return (
            <div
              key={i}
              className={cn(
                'pointer-events-none absolute z-10',
                id === 'selection' && 'bg-brand/25',
                id === 'selection' && isCursor && 'bg-brand',
                classNames?.selectionRect
              )}
              style={{
                ...selectionStyle,
                ...position,
              }}
            />
          );
        })}
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
      minSelectionWidth={1}
    />
  );
}
