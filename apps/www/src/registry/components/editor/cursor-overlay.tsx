'use client';

import * as React from 'react';

import { AIChatPlugin } from '@platejs/ai/react';
import {
  type CursorData,
  type CursorOverlayState,
  useCursorOverlayPositions,
} from '@platejs/cursor';
import { CursorOverlayPlugin } from '@platejs/selection/react';
import { BaseTablePlugin } from '@platejs/table';
import { RangeApi } from 'platejs';
import { useEditor, usePlateValue, usePluginStore } from 'platejs/react';

import { cn } from '@/lib/utils';

export function CursorOverlay() {
  const containerRef = usePlateValue('containerRef');
  const cursorStates = usePluginStore(CursorOverlayPlugin, 'cursors');
  const { cursors } = useCursorOverlayPositions({
    containerRef,
    cursors: cursorStates,
  });

  return (
    <>
      {cursors.map((cursor) => (
        <Cursor key={cursor.id} {...cursor} />
      ))}
    </>
  );
}

function Cursor({
  id,
  caretPosition,
  data,
  selection,
  selectionRects,
}: CursorOverlayState<CursorData>) {
  const editor = useEditor();
  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const { style, selectionStyle = style } = data ?? ({} as CursorData);
  const isCursor = selection ? RangeApi.isCollapsed(selection) : false;

  if (streaming) return null;

  // Skip overlay for multi-cell table selection (table has its own selection UI)
  if (id === 'selection' && selection) {
    const cellEntries = editor.plugin(BaseTablePlugin).read.getGridAbove({
      at: selection,
      format: 'cell',
    });

    if (cellEntries.length > 1) {
      return null;
    }
  }

  return (
    <>
      {selectionRects.map((position, i) => (
        <div
          key={i}
          className={cn(
            'pointer-events-none absolute z-10',
            id === 'selection' && 'bg-brand/25',
            id === 'selection' && isCursor && 'bg-primary'
          )}
          style={{
            ...selectionStyle,
            ...position,
          }}
        />
      ))}
      {caretPosition && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-0.5',
            id === 'drag' && 'w-px bg-brand'
          )}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}

export const CursorOverlayKit = [
  CursorOverlayPlugin.configure({
    render: {
      afterEditable: () => <CursorOverlay />,
    },
  }),
] as const;
