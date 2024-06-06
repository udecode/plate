import type { TNode, TNodeEntry } from '../interfaces';

/** Filter nodes. */
export interface QueryNodeOptions {
  /** List of types that are valid. If empty or undefined - allow all. */
  allow?: null | string | string[];

  /** List of types that are invalid. */
  exclude?: null | string | string[];

  /** Query the node entry. */
  filter?: <N extends TNode>(entry: TNodeEntry<N>) => boolean;

  /** Valid path levels. */
  level?: null | number | number[];

  /** Paths above that value are invalid. */
  maxLevel?: null | number;
}
