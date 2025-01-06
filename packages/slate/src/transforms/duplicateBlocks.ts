import { type Editor, type NodeEntry, PathApi } from '../interfaces';

export const duplicateBlocks = (editor: Editor, blocks: NodeEntry[]) => {
  const lastBlock = blocks.at(-1);

  if (!lastBlock) return;

  editor.tf.insertNodes(blocks.map((item) => item[0]) as any, {
    at: PathApi.next(lastBlock[1]),
  });
};
