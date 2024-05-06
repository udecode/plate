import {
  type PlateEditor,
  type Value,
  getNodeEntries,
} from '@udecode/plate-common/server';

import type { TCommentText } from '../types';

import { isCommentText } from '../utils/index';

export const getCommentNodeEntries = <V extends Value>(
  editor: PlateEditor<V>
) => {
  return [
    ...getNodeEntries<TCommentText>(editor, {
      at: [],
      match: (n) => isCommentText(n),
    }),
  ];
};
