import { TNode } from '../../slate/types/TNode';
import { TNodeEntry } from '../../slate/types/TNodeEntry';

/**
 * Filter nodes.
 */
export interface QueryNodeOptions<N extends TNode> {
  /**
   * Query the node entry.
   */
  filter?: (entry: TNodeEntry<N>) => boolean;

  /**
   * List of types that are valid. If empty or undefined - allow all.
   */
  allow?: string[] | string;

  /**
   * List of types that are invalid.
   */
  exclude?: string[] | string;
}
