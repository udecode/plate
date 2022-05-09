import { TNode } from '../../slate/node/TNode';
import { TNodeEntry } from '../../slate/node/TNodeEntry';

/**
 * Filter nodes.
 */
export interface QueryNodeOptions {
  /**
   * Query the node entry.
   */
  filter?: <N extends TNode>(entry: TNodeEntry<N>) => boolean;

  /**
   * List of types that are valid. If empty or undefined - allow all.
   */
  allow?: string[] | string;

  /**
   * List of types that are invalid.
   */
  exclude?: string[] | string;
}
