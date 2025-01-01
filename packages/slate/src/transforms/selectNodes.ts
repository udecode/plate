import type { TEditor, TNodeEntry } from '../interfaces';

import { getNodesRange } from '../queries';

export const selectNodes = (editor: TEditor, nodes: TNodeEntry[]) => {
  const range = getNodesRange(editor, nodes);

  if (!range) return;

  editor.tf.setSelection(range);
};
