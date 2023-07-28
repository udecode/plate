import { ClientRectObject } from '@floating-ui/core';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

const IS_FIREFOX =
  typeof navigator !== 'undefined' &&
  /^(?!.*seamonkey)(?=.*firefox).*/i.test(navigator.userAgent);

/**
 * Get bounding client rect of the window selection
 */
export const getSelectionBoundingClientRect = (): ClientRectObject => {
  const domSelection = window.getSelection();

  if (!domSelection || domSelection.rangeCount < 1) {
    return getDefaultBoundingClientRect();
  }

  if (IS_FIREFOX && domSelection.rangeCount > 1) {
    const firstRange = domSelection.getRangeAt(0);
    const lastRange = domSelection.getRangeAt(domSelection.rangeCount - 1);

    const domRange =
      firstRange.startContainer === domSelection.focusNode
        ? lastRange
        : firstRange;
    return domRange.getBoundingClientRect();
  } else {
    const domRange = domSelection.getRangeAt(0);

    return domRange.getBoundingClientRect();
  }
};
