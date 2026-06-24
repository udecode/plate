import type { PlateEditor } from 'platejs/react';

import { PathApi } from 'platejs';

import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '../BlockSelectionPlugin';

export const duplicateBlockSelectionNodes = (editor: PlateEditor) => {
  const blocks = (
    editor.api as unknown as BlockSelectionConfig['api']
  ).blockSelection.getNodes();

  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  const path = PathApi.next(lastBlock[1]);

  editor.update((tx) => {
    tx.nodes.insert(
      blocks.map(([node]) => node),
      { at: path }
    );
  });

  const ids = blocks
    .map((_, index) => {
      const targetPath = [path[0] + index];
      const targetNode = editor.api.node(targetPath);

      return targetNode?.[0].id as string;
    })
    .filter(Boolean);

  setTimeout(() => {
    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(ids));
  }, 0);
};
