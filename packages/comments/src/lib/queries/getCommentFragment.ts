import type { SlateEditor } from '@udecode/plate-common';
import type { Range } from 'slate';

import { getCommentNodesById } from './getCommentNodesById';

export const getCommentFragment = (editor: SlateEditor, id: string) => {
  const nodes = getCommentNodesById(editor, id);

  if (nodes.length === 0) return;

  const firstNodePath = nodes[0][1];
  const lastNodePath = nodes.at(-1)![1];

  const range: Range = {
    anchor: editor.api.start(firstNodePath)!,
    focus: editor.api.end(lastNodePath)!,
  };

  return editor.api.fragment(range);
};
