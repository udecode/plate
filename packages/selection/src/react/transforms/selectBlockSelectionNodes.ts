import type { SlateEditor } from 'platejs';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

export const selectBlockSelectionNodes = (editor: SlateEditor) => {
  const blockSelectionApi = (
    editor.api as unknown as BlockSelectionConfig['api']
  ).blockSelection;
  const range = editor.api.nodesRange(blockSelectionApi.getNodes());

  if (!range) return;

  editor.update((tx) => {
    tx.selection.set(range);
  });
  blockSelectionApi.clear();
};
