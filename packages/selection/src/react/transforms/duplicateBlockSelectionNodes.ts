import type { PlateEditor } from '@udecode/plate/react';

import { PathApi } from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const duplicateBlockSelectionNodes = (editor: PlateEditor) => {
  const blocks = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes();

  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  editor.tf.duplicateNodes({
    at: lastBlock[1],
    nextBlock: true,
    nodes: blocks,
  });

  const path = PathApi.next(lastBlock[1]);

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
