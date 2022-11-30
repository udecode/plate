import { getNodeEntries, PlateEditor, Value } from '@udecode/plate-core';
import { TCommentText } from '../types';
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
