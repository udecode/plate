import type { PlateEditor } from '@udecode/plate/react';

import { type NodeEntry, PathApi, duplicateBlocks } from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const duplicateBlockSelectionNodes = (
  editor: PlateEditor,
  blocks: NodeEntry[]
) => {
  duplicateBlocks(editor, blocks);

  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  const path = PathApi.next(lastBlock[1]);

  const ids = blocks
    .map((_, index) => {
      const targetPath = [path[0] + index];
      const targetNode = editor.api.node(targetPath);

      return targetNode?.[0].id;
    })
    .filter(Boolean);

  const api = editor.getApi(BlockSelectionPlugin);

  setTimeout(() => {
    api.blockSelection.setSelectedIds({ ids } as any);
  }, 0);
};
