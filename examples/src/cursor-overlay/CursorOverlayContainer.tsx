import React from 'react';
import { CursorOverlay, CursorOverlayProps } from '@udecode/plate';
import { cursorStore } from './cursorStore';

export const CursorOverlayContainer = (props: CursorOverlayProps) => {
  const cursors = cursorStore.use.cursors();

  return <CursorOverlay {...props} cursors={cursors} />;
};
