import type { ClientRectObject } from '@floating-ui/core';
import type { Range } from '@platejs/slate';
import type { PlateEditor } from 'platejs/react';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect by slate range */
export const getRangeBoundingClientRect = (
  editor: PlateEditor,
  at: Range | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  const domRange = editor.api.dom.resolveDOMRange(at);

  if (!domRange) return getDefaultBoundingClientRect();

  return domRange.getBoundingClientRect();
};
