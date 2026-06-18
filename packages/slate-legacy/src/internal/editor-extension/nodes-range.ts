import type { Editor, NodeEntry } from '../../interfaces/index';

export const nodesRange = (editor: Editor, nodes: NodeEntry[]) => {
  if (nodes.length === 0) return;

  const firstBlockPath = nodes[0][1];
  const lastBlockPath = nodes.at(-1)![1];

  return editor.api.range(firstBlockPath, lastBlockPath);
};
