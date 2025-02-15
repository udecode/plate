import type { EditorNodesOptions, SlateEditor } from '@udecode/plate';

import type { TCommentText } from '../types';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const findCommentNode = (
  editor: SlateEditor,
  options?: EditorNodesOptions
) => {
  return editor.api.node<TCommentText>({
    match: (n) => n[BaseCommentsPlugin.key],
    ...options,
  });
};

export const findCommentNodes = (
  editor: SlateEditor,
  options?: EditorNodesOptions
) => {
  return editor.api.nodes<TCommentText>({
    match: (n) => n[BaseCommentsPlugin.key],
    ...options,
  });
};
