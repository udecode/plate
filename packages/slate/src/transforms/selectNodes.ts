import type { Editor, TNodeEntry } from '../interfaces';

export const selectNodes = (editor: Editor, nodes: TNodeEntry[]) => {
  const range = editor.api.nodesRange(nodes);

  if (!range) return;

  editor.tf.setSelection(range);
};
