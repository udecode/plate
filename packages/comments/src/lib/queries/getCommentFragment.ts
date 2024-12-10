import type { Range } from 'slate';

import {
  type SlateEditor,
  getEndPoint,
  getFragment,
  getStartPoint,
} from '@udecode/plate-common';

import { getCommentNodesById } from './getCommentNodesById';

export const getCommentFragment = (editor: SlateEditor, id: string) => {
  const nodes = getCommentNodesById(editor, id);

  if (nodes.length === 0) return;

  const firstNodePath = nodes[0][1];
  const lastNodePath = nodes.at(-1)![1];

  const range: Range = {
    anchor: getStartPoint(editor, firstNodePath),
    focus: getEndPoint(editor, lastNodePath),
  };

  return getFragment(editor, range);
};
