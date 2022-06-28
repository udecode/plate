import React from 'react';
import { CursorOverlay, CursorOverlayProps } from '@udecode/plate';
import { cursorStore } from './cursorStore';

export const CursorOverlayContainer = ({
  cursors,
  ...props
}: CursorOverlayProps) => {
  const dynamicCursors = cursorStore.use.cursors();

  return (
    <CursorOverlay {...props} cursors={{ ...cursors, ...dynamicCursors }} />
  );
};
