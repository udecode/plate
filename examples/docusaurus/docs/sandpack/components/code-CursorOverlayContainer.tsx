export const CursorOverlayContainerCode = `import React from 'react';
import { CursorOverlay, CursorOverlayProps } from '@udecode/plate';
import { cursorStore } from '../plugins/plugins';

export const CursorOverlayContainer = (props: CursorOverlayProps) => {
  const cursors = cursorStore.use.cursors();

  return <CursorOverlay {...props} cursors={cursors} />;
};
`;