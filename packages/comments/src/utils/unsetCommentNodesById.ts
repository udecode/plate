import { PlateEditor, unsetNodes, Value } from '@udecode/plate-common';
import { TCommentText } from '../types';
import { getCommentKey } from './getCommentKey';
import { isCommentNodeById } from './isCommentNodeById';

export const unsetCommentNodesById = <V extends Value>(
  editor: PlateEditor<V>,
  { id }: { id: string }
) => {
  unsetNodes<TCommentText>(editor, getCommentKey(id), {
    at: [],
    match: (n) => isCommentNodeById(n, id),
  });
};
