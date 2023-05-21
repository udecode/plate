import React from 'react';
import { CursorOverlay, CursorOverlayProps } from '@udecode/plate-cursor';
import { cursorStore } from './cursorStore';

export function CursorOverlayContainer({
  cursors,
  ...props
}: CursorOverlayProps) {
  const dynamicCursors = cursorStore.use.cursors();

  const allCursors = { ...cursors, ...dynamicCursors };

  return <CursorOverlay {...props} cursors={allCursors} />;
}
