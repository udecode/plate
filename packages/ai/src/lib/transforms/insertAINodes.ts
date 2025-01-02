import type { Path } from 'slate';

import {
  type SlateEditor,
  type TDescendant,
  getEndPoint,
  insertNodes,
} from '@udecode/plate-common';

export const insertAINodes = (
  editor: SlateEditor,
  nodes: TDescendant[],
  {
    target,
  }: {
    target?: Path;
  } = {}
) => {
  if (!target && !editor.selection?.focus.path) return;

  const aiNodes = nodes.map((node) => ({
    ...node,
    ai: true,
  }));

  editor.tf.withoutNormalizing(() => {
    insertNodes(editor, aiNodes, {
      at: getEndPoint(editor, target || editor.selection!.focus.path),
      select: true,
    });
    editor.tf.collapse({ edge: 'end' });
  });
};
