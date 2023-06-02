import React from 'react';
import { createStore } from '@udecode/plate';
import {
  CursorOverlay as CursorOverlayPrimitive,
  CursorOverlayProps,
} from '@udecode/plate-cursor';

import { Cursor } from '@/plate/aui/cursor';

export const cursorStore = createStore('cursor')({
  cursors: {},
});

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
