import {
  type FindNodeOptions,
  type SlateEditor,
  findNode,
} from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const findCommentNode = (
  editor: SlateEditor,
  options?: FindNodeOptions
) => {
  return findNode<TCommentText>(editor, {
    match: (n) => n[BaseCommentsPlugin.key],
    ...options,
  });
};
