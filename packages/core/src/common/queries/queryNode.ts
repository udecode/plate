import castArray from 'lodash/castArray';
import { TNode } from '../../slate/node/TNode';
import { TNodeEntry } from '../../slate/node/TNodeEntry';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

/**
 * Query the node entry.
 */
export const queryNode = <N extends TNode>(
  entry?: TNodeEntry<N>,
  { filter, allow, exclude }: QueryNodeOptions = {}
) => {
  if (!entry) return false;

  if (filter && !filter(entry)) {
    return false;
  }

  if (allow) {
    const allows = castArray(allow);

    if (allows.length && !allows.includes(entry[0].type as any)) {
      return false;
    }
  }

  if (exclude) {
    const excludes = castArray(exclude);

    if (excludes.length && excludes.includes(entry[0].type as any)) {
      return false;
    }
  }

  return true;
};
