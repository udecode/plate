import type { BasePlateEditor } from 'platejs';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

export const selectBlockSelectionNodes = (editor: BasePlateEditor) => {
  const blockSelectionApi = (
    editor.api as unknown as BlockSelectionConfig['api']
  ).blockSelection;
  const nodes = blockSelectionApi.getNodes();
  const range = editor.read((state) => {
    if (nodes.length === 0) return;

    const first = nodes[0]![1];
    const last = nodes.at(-1)![1];

    return state.ranges.get(first, last);
  });

  if (!range) return;

  editor.update((tx) => {
    tx.selection.set(range);
  });
  blockSelectionApi.clear();
};
