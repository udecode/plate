import castArray from 'lodash/castArray';

import { TNode, TNodeEntry } from '../interfaces';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

/**
 * Query the node entry.
 */
export const queryNode = <N extends TNode>(
  entry?: TNodeEntry<N>,
  { filter, allow, exclude, level, maxLevel }: QueryNodeOptions = {}
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
