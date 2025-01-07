import type { NodeEntry, TNode } from '../interfaces';

function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/** Filter nodes. */
export interface QueryNodeOptions {
  /** List of types that are valid. If empty or undefined - allow all. */
  allow?: string[] | string | null;

  /** List of types that are invalid. */
  exclude?: string[] | string | null;

  /** Query the node entry. */
  filter?: <N extends TNode>(entry: NodeEntry<N>) => boolean;

  /** Valid path levels. */
  level?: number[] | number | null;

  /** Paths above that value are invalid. */
  maxLevel?: number | null;
}

/** Query the node entry. */
export const queryNode = <N extends TNode>(
  entry?: NodeEntry<N>,
  { allow, exclude, filter, level, maxLevel }: QueryNodeOptions = {}
) => {
  if (!entry) return false;

  const [node, path] = entry;

  if (level) {
    const levels = castArray(level);

    if (!levels.includes(path.length)) {
      return false;
    }
  }
  if (maxLevel && path.length > maxLevel) {
    return false;
  }
  if (filter && !filter(entry)) {
    return false;
  }
  if (allow) {
    const allows = castArray(allow);

    if (allows.length > 0 && !allows.includes(node.type as any)) {
      return false;
    }
  }
  if (exclude) {
    const excludes = castArray(exclude);

    if (excludes.length > 0 && excludes.includes(node.type as any)) {
      return false;
    }
  }

  return true;
};
