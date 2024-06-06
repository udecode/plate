import type { ClientRectObject } from '@floating-ui/core';
import type { Value } from '@udecode/plate-common/server';
import type { Range } from 'slate';

import { type TReactEditor, toDOMRange } from '@udecode/plate-common';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect by slate range */
export const getRangeBoundingClientRect = <V extends Value>(
  editor: TReactEditor<V>,
  at: Range | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  const domRange = toDOMRange(editor, at);

  if (!domRange) return getDefaultBoundingClientRect();

  return domRange.getBoundingClientRect();
};
