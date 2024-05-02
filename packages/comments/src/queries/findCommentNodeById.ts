import { findNode, PlateEditor, Value } from '@udecode/plate-common/server';

import { TCommentText } from '../types';
import { getCommentKey } from '../utils/getCommentKey';

export const findCommentNodeById = <V extends Value>(
  editor: PlateEditor<V>,
  id: string
) => {
  return findNode<TCommentText>(editor, {
    at: [],
    match: (n) => n[getCommentKey(id)],
  });
};
