import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { PathApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const duplicateBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const { api, setOption } = editor.plugin(BlockSelectionPlugin);
  const blocks = api.getNodes();
  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  tx.nodes.duplicate(blocks);

  const path = PathApi.next(lastBlock[1]);
  const ids = blocks
    .map((_, index) => {
      const targetPath = [path[0] + index];
      const targetNode = editor.read.nodes.get(targetPath);

      return targetNode?.[0].id as string;
    })
    .filter(Boolean);

  setTimeout(() => {
    setOption('selectedIds', new Set(ids));
  }, 0);
};
