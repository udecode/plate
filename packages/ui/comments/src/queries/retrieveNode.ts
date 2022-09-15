import { NodeEntry } from 'slate';

export const retrieveNode = (nodeEntry: NodeEntry) => {
  const [node] = nodeEntry;
  return node;
};
