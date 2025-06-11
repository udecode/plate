import type { TIdElement } from 'platejs';

import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

export const moveSelection = (
  editor: PlateEditor,
  direction: 'down' | 'up'
) => {
  const { api, setOption } = getEditorPlugin(editor, BlockSelectionPlugin);
  const blocks = api.blockSelection.getNodes();

  if (blocks.length === 0) return;
  if (direction === 'up') {
    const [, topPath] = blocks[0];

    const prevEntry = editor.api.previous<TIdElement>({
      at: topPath,
      from: 'parent',
      match: api.blockSelection.isSelectable,
    });

    if (prevEntry) {
      const [prevNode] = prevEntry;
      setOption('anchorId', prevNode.id);
      api.blockSelection.set(prevNode.id);
    } else {
      api.blockSelection.set(blocks[0][0].id);
    }
  } else {
    // direction === 'down'
    const [, bottomPath] = blocks.at(-1)!;

    const nextEntry = editor.api.next<TIdElement>({
      at: bottomPath,
      from: 'child',
      match: api.blockSelection.isSelectable,
    });

    if (nextEntry) {
      const [nextNode] = nextEntry;
      setOption('anchorId', nextNode.id);
      api.blockSelection.set(nextNode.id);
    } else {
      api.blockSelection.set(blocks.at(-1)![0].id);
    }
  }
};
