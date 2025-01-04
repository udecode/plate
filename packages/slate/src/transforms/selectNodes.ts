import type { TEditor, TNodeEntry } from '../interfaces';

export const selectNodes = (editor: TEditor, nodes: TNodeEntry[]) => {
  const range = editor.api.nodesRange(nodes);

  if (!range) return;

  editor.tf.setSelection(range);
};
