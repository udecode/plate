import type { SlateEditor } from '@udecode/plate';

import type { TCommentText } from '../types';

import { isCommentText } from '../utils';

export const getCommentNodeEntries = (editor: SlateEditor) => {
  return [
    ...editor.api.nodes<TCommentText>({
      at: [],
      match: (n) => isCommentText(n),
    }),
  ];
};
