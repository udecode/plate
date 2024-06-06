import type { ClientRectObject } from '@floating-ui/core';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect of the window selection */
export const getSelectionBoundingClientRect = (): ClientRectObject => {
  const domSelection = window.getSelection();

  if (!domSelection || domSelection.rangeCount < 1) {
    return getDefaultBoundingClientRect();
  }

  const domRange = domSelection.getRangeAt(0);

  return domRange.getBoundingClientRect();
};
