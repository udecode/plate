import { Path } from 'slate';

import type { Editor, TNodeEntry } from '../interfaces';

export const duplicateBlocks = (editor: Editor, blocks: TNodeEntry[]) => {
  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  editor.tf.insertNodes(blocks.map((item) => item[0]) as any, {
    at: Path.next(lastBlock[1]),
  });
};
