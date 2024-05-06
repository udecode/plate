import {
  type FindNodeOptions,
  type PlateEditor,
  type Value,
  findNode,
} from '@udecode/plate-common/server';

import type { TCommentText } from '../types';

import { MARK_COMMENT } from '../constants';

export const findCommentNode = <V extends Value>(
  editor: PlateEditor<V>,
  options?: FindNodeOptions
) => {
  return findNode<TCommentText>(editor, {
    match: (n) => n[MARK_COMMENT],
    ...options,
  });
};
