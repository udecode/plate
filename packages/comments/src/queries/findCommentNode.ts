import {
  type FindNodeOptions,
  type PlateEditor,
  findNode,
} from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { CommentsPlugin } from '../CommentsPlugin';

export const findCommentNode = (
  editor: PlateEditor,
  options?: FindNodeOptions
) => {
  return findNode<TCommentText>(editor, {
    match: (n) => n[CommentsPlugin.key],
    ...options,
  });
};
