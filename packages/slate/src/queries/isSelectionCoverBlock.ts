import type { Range } from 'slate';

import type { TEditor, ValueOf } from '../interfaces';
import type { GetAboveNodeOptions } from '../interfaces/editor/editor-types';

import { isRangeInSameBlock } from './isRangeInSameBlock';
import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';

// TODO: test
export const isSelectionCoverBlock = <E extends TEditor>(
  editor: E,
  {
    at,
    ...options
  }: { at?: Range | null } & Omit<GetAboveNodeOptions<ValueOf<E>>, 'at'> = {}
) => {
  return (
    isSelectionAtBlockEnd(editor, options) &&
    isSelectionAtBlockStart(editor, options) &&
    isRangeInSameBlock(editor, options)
  );
};
