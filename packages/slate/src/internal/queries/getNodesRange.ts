import type { TEditor, TNodeEntry } from '../../interfaces/index';

export const getNodesRange = (editor: TEditor, nodes: TNodeEntry[]) => {
  if (nodes.length === 0) return;

  const firstBlockPath = nodes[0][1];
  const lastBlockPath = nodes.at(-1)![1];

  return editor.api.range(firstBlockPath, lastBlockPath);
};
