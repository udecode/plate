import { NodeEntry } from 'slate';

/**
 * Filter nodes.
 */
export interface QueryNodeOptions {
  /**
   * Query the node entry.
   */
  filter?: (entry: NodeEntry) => boolean;

  /**
   * List of types that are valid. If empty or undefined - allow all.
   */
  allow?: string[] | string;

  /**
   * List of types that are invalid.
   */
  exclude?: string[] | string;
}
