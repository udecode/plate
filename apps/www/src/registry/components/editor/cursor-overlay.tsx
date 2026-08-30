'use client';

import { RangeApi } from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import {
  type CursorData,
  type CursorOverlayState,
  CursorOverlayPlugin,
  useCursorOverlayPositions,
} from 'platejs/cursor/react';
import { useEditor, usePlateValue, usePluginStore } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import * as React from 'react';

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
  const { style, selectionStyle = style } = data ?? {};
  const isCursor = selection ? RangeApi.isCollapsed(selection) : false;

  if (streaming) return null;

  // Skip overlay for multi-cell table selection (table has its own selection UI)
  if (id === 'selection' && selection) {
    const cellEntries =
      editor.plugin(BaseTablePlugin).read.selection(selection)?.cellEntries ??
      [];

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
