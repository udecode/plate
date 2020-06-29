import { Node, NodeEntry } from 'slate';

export interface QueryOptions {
  // Condition on the node to be valid.
  filter?: (entry: NodeEntry<Node>) => boolean;
  // List of types that are valid. If empty or undefined - allow all.
  allow?: string[];
  // List of types that are invalid.
  exclude?: string[];
}
