import { PlateEditor, Value, getNodeEntries } from '@udecode/plate-common';

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
