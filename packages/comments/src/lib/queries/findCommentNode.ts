import type { FindNodeOptions, SlateEditor } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const findCommentNode = (
  editor: SlateEditor,
  options?: FindNodeOptions
) => {
  return editor.api.find<TCommentText>({
    match: (n) => n[BaseCommentsPlugin.key],
    ...options,
  });
};
