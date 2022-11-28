import { PlateEditor, unsetNodes, Value } from '@udecode/plate-core';
import { TCommentText } from '../types';
import { isCommentNodeById } from './isCommentNodeById';
import { getCommentKey } from './utils';

export const unsetCommentNodesById = <V extends Value>(
  editor: PlateEditor<V>,
  { id }: { id: string }
) => {
  unsetNodes<TCommentText>(editor, getCommentKey(id), {
    at: [],
    match: (n) => isCommentNodeById(n, id),
  });
};
