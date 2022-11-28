import { PlateEditor, TNode, Value } from '@udecode/plate-core';
import { MARK_COMMENT } from '../constants';
import { TCommentText } from '../types';

export const isCommentText = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is TCommentText => {
  return !!node[MARK_COMMENT];
};
