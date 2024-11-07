import type { PlateEditor } from '@udecode/plate-common/react';

import {
  type TNodeEntry,
  duplicateBlocks,
  getNodeEntry,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const duplicateBlockSelectionNodes = (
  editor: PlateEditor,
  blocks: TNodeEntry[]
) => {
  duplicateBlocks(editor, blocks);

  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  const path = Path.next(lastBlock[1]);

  const ids = blocks
    .map((_, index) => {
      const targetPath = [path[0] + index];
      const targetNode = getNodeEntry(editor, targetPath);

      return targetNode?.[0].id;
    })
    .filter(Boolean);

  const api = editor.getApi(BlockSelectionPlugin);

  setTimeout(() => {
    api.blockSelection.setSelectedIds({ ids } as any);
  }, 0);
};
