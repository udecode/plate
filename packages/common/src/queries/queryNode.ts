import { TNode } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { NodeEntry } from 'slate';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

/**
 * Query the node entry.
 */
export const queryNode = <T extends TNode>(
  entry?: NodeEntry<T>,
  { filter, allow, exclude }: QueryNodeOptions = {}
) => {
  if (!entry) return false;

  if (filter && !filter(entry)) {
    return false;
  }

  if (allow) {
    const allows = castArray(allow);

    if (allows.length && !allows.includes(entry[0].type)) {
      return false;
    }
  }

  if (exclude) {
    const excludes = castArray(exclude);

    if (excludes.length && excludes.includes(entry[0].type)) {
      return false;
    }
  }

  return true;
};
