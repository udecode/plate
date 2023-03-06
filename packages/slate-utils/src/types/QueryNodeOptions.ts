import { TNode, TNodeEntry } from '@udecode/slate';

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
  allow?: string[] | string | null;

  /**
   * List of types that are invalid.
   */
  exclude?: string[] | string | null;

  /**
   * Valid path levels.
   */
  level?: number[] | number | null;

  /**
   * Paths above that value are invalid.
   */
  maxLevel?: number | null;
}
