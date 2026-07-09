import type { BaseEditor } from '@platejs/core';
import type { TIdElement } from '@platejs/utils';

import { ElementApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

export const moveSelection = (editor: BaseEditor, direction: 'down' | 'up') => {
  const { api, setOption } = editor.plugin(BlockSelectionPlugin);
  const blocks = api.getNodes();

  if (blocks.length === 0) return;
  if (direction === 'up') {
    const [, topPath] = blocks[0];

    const prevEntry = editor.read.nodes.previous<TIdElement>({
      at: topPath,
      from: 'parent',
      match: (node, path) =>
        ElementApi.isElement(node) && api.isSelectable(node, path),
    });

    if (prevEntry) {
      const [prevNode] = prevEntry;
      setOption('anchorId', prevNode.id);
      api.set(prevNode.id);
    } else {
      api.set(blocks[0][0].id);
    }
  } else {
    const [, bottomPath] = blocks.at(-1)!;

    const nextEntry = editor.read.nodes.next<TIdElement>({
      at: bottomPath,
      from: 'child',
      match: (node, path) =>
        ElementApi.isElement(node) && api.isSelectable(node, path),
    });

    if (nextEntry) {
      const [nextNode] = nextEntry;
      setOption('anchorId', nextNode.id);
      api.set(nextNode.id);
    } else {
      api.set(blocks.at(-1)![0].id);
    }
  }
};
