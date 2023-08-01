import {
  findNode,
  FindNodeOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { MARK_COMMENT } from '../constants';
import { TCommentText } from '../types';

export const findCommentNode = <V extends Value>(
  editor: PlateEditor<V>,
  options?: FindNodeOptions
) => {
  return findNode<TCommentText>(editor, {
    match: (n) => n[MARK_COMMENT],
    ...options,
  });
};
