import type { TEditor, TNodeEntry } from '@udecode/slate';

import { Path } from 'slate';

export const duplicateBlocks = (editor: TEditor, blocks: TNodeEntry[]) => {
  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  editor.insertNodes(blocks.map((item) => item[0]) as any, {
    at: Path.next(lastBlock[1]),
  });
};
