export const cursorOverlayContainerCode = `import React from 'react';
import { CursorOverlay, CursorOverlayProps } from '@udecode/plate';
import { cursorStore } from './cursorStore';

export const CursorOverlayContainer = ({
  cursors,
  ...props
}: CursorOverlayProps) => {
  const dynamicCursors = cursorStore.use.cursors();

  const allCursors = { ...cursors, ...dynamicCursors };

  return <CursorOverlay {...props} cursors={allCursors} />;
};
`;

export const cursorOverlayContainerFile = {
  '/cursor-overlay/CursorOverlayContainer.tsx': cursorOverlayContainerCode,
};
