import {
  type PlateEditor,
  type Value,
  unsetNodes,
} from '@udecode/plate-common/server';

import type { TCommentText } from '../types';

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
