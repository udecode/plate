import { type PlateEditor, getNodeEntries } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { isCommentText } from '../utils/index';

export const getCommentNodeEntries = (editor: PlateEditor) => {
  return [
    ...getNodeEntries<TCommentText>(editor, {
      at: [],
      match: (n) => isCommentText(n),
    }),
  ];
};
