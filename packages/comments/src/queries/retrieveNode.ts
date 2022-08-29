import { Node, NodeEntry } from 'slate';

export function retrieveNode(nodeEntry: NodeEntry): Node {
  return nodeEntry[0];
}
