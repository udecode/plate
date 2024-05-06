import type { TNode, TNodeEntry } from '../interfaces';
import type { QueryNodeOptions } from '../types/QueryNodeOptions';

function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/** Query the node entry. */
export const queryNode = <N extends TNode>(
  entry?: TNodeEntry<N>,
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
