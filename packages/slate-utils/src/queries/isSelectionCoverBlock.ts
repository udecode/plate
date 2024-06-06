import type { GetAboveNodeOptions, TEditor, Value } from '@udecode/slate';
import type { Range } from 'slate';

import { isRangeInSameBlock } from './isRangeInSameBlock';
import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';

// TODO: test
export const isSelectionCoverBlock = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    ...options
  }: { at?: Range | null } & Omit<GetAboveNodeOptions<V>, 'at'> = {}
) => {
  return (
    isSelectionAtBlockEnd(editor, options) &&
    isSelectionAtBlockStart(editor, options) &&
    isRangeInSameBlock(editor, options)
  );
};
