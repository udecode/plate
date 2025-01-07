import type { SlateEditor } from '@udecode/plate';

import type { TCommentText } from '../types';

import { getCommentKey } from '../utils';

export const findCommentNodeById = (editor: SlateEditor, id: string) => {
  return editor.api.node<TCommentText>({
    at: [],
    match: (n) => n[getCommentKey(id)],
  });
};
