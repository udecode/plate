import type { SlateEditor } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { getCommentKey } from '../utils';

export const findCommentNodeById = (editor: SlateEditor, id: string) => {
  return editor.api.find<TCommentText>({
    at: [],
    match: (n) => n[getCommentKey(id)],
  });
};
