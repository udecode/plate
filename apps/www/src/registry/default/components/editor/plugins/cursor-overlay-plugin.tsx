'use client';

import { CursorOverlayPlugin } from '@udecode/plate-selection/react';

import { CursorOverlay } from '@/registry/default/plate-ui/cursor-overlay';

export const cursorOverlayPlugin = CursorOverlayPlugin.configure({
  render: {
    afterEditable: () => <CursorOverlay />,
  },
});
