import { Path } from 'slate';

import type { TEditor, TNodeEntry } from '../interfaces';

export const duplicateBlocks = (editor: TEditor, blocks: TNodeEntry[]) => {
  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  editor.tf.insertNodes(blocks.map((item) => item[0]) as any, {
    at: Path.next(lastBlock[1]),
  });
};
