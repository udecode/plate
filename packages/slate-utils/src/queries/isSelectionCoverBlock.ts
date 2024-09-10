import type { GetAboveNodeOptions, TEditor } from '@udecode/slate';
import type { Range } from 'slate';

import { isRangeInSameBlock } from './isRangeInSameBlock';
import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';

// TODO: test
export const isSelectionCoverBlock = <E extends TEditor>(
  editor: E,
  {
    at,
    ...options
  }: { at?: Range | null } & Omit<GetAboveNodeOptions<E>, 'at'> = {}
) => {
  return (
    isSelectionAtBlockEnd(editor, options) &&
    isSelectionAtBlockStart(editor, options) &&
    isRangeInSameBlock(editor, options)
  );
};
