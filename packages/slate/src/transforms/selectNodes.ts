import type { Editor, NodeEntry } from '../interfaces';

export const selectNodes = (editor: Editor, nodes: NodeEntry[]) => {
  const range = editor.api.nodesRange(nodes);

  if (!range) return;

  editor.tf.setSelection(range);
};
