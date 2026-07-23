import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateContext,
  EditorUpdateTransaction,
} from '@platejs/plite';

import { PathApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { getBlockSelectionNodes } from '../internal/getBlockSelectionNodes';

export const duplicateBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { afterCommit }: EditorUpdateContext
) => {
  const { getOption, setOption } = editor.plugin(BlockSelectionPlugin);
  const blocks = getBlockSelectionNodes(tx, getOption('selectedIds'));
  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  tx.nodes.duplicate(blocks);

  const path = PathApi.next(lastBlock[1]);
  const ids = blocks
    .map((_, index) => {
      const targetPath = [path[0] + index];
      const targetNode = tx.nodes.get(targetPath);

      return targetNode?.[0].id as string;
    })
    .filter(Boolean);

  afterCommit(() => {
    setOption('selectedIds', new Set(ids));
  });
};
