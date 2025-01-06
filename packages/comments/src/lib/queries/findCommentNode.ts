import type { EditorFindOptions, SlateEditor } from '@udecode/plate';

import type { TCommentText } from '../types';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const findCommentNode = (
  editor: SlateEditor,
  options?: EditorFindOptions
) => {
  return editor.api.find<TCommentText>({
    match: (n) => n[BaseCommentsPlugin.key],
    ...options,
  });
};
