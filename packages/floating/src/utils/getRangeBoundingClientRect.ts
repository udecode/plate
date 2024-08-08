import type { ClientRectObject } from '@floating-ui/core';
import type { Range } from 'slate';

import { type TReactEditor, toDOMRange } from '@udecode/plate-common';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect by slate range */
export const getRangeBoundingClientRect = (
  editor: TReactEditor,
  at: Range | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  const domRange = toDOMRange(editor, at);

  if (!domRange) return getDefaultBoundingClientRect();

  return domRange.getBoundingClientRect();
};
