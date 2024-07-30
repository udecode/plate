import {
  type FindNodeOptions,
  type PlateEditor,
  findNode,
} from '@udecode/plate-common/server';

import type { TCommentText } from '../types';

import { MARK_COMMENT } from '../constants';

export const findCommentNode = (
  editor: PlateEditor,
  options?: FindNodeOptions
) => {
  return findNode<TCommentText>(editor, {
    match: (n) => n[MARK_COMMENT],
    ...options,
  });
};
