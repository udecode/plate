import type { ClientRectObject } from '@floating-ui/core';
import type { Editor, TRange } from '@udecode/plate';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect by slate range */
export const getRangeBoundingClientRect = (
  editor: Editor,
  at: TRange | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  const domRange = editor.api.toDOMRange(at);

  if (!domRange) return getDefaultBoundingClientRect();

  return domRange.getBoundingClientRect();
};
