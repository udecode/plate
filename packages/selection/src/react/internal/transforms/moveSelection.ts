import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { getNextSelectable } from './getNextSelectable';
import { getPreviousSelectable } from './getPreviousSelectable';

export const moveSelection = (
  editor: PlateEditor,
  direction: 'down' | 'up'
) => {
  const { api, setOption } = getEditorPlugin(editor, BlockSelectionPlugin);
  const blocks = api.blockSelection.getNodes();

  if (blocks.length === 0) return;
  if (direction === 'up') {
    const [, topPath] = blocks[0];

    const prevEntry = getPreviousSelectable(editor, topPath);

    if (prevEntry) {
      const [prevNode] = prevEntry;
      setOption('anchorId', prevNode.id ?? null);
      api.blockSelection.addSelectedRow(prevNode.id, { clear: true });
    }
  } else {
    // direction === 'down'
    const [, bottomPath] = blocks.at(-1)!;

    const nextEntry = getNextSelectable(editor, bottomPath);

    if (nextEntry) {
      const [nextNode] = nextEntry;
      console.log(nextNode);
      setOption('anchorId', nextNode.id ?? null);
      api.blockSelection.addSelectedRow(nextNode.id, { clear: true });
    }
  }
};
