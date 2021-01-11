import castArray from 'lodash/castArray';
import { Node, NodeEntry } from 'slate';
import { QueryOptions } from '../types/QueryOptions.types';

/**
 * Is the node entry filling a condition.
 */
export const isNode = (
  entry?: NodeEntry<Node>,
  { filter = () => true, allow = [], exclude = [] }: QueryOptions = {}
) => {
  const allows = castArray(allow);
  const excludes = castArray(exclude);

  let filterAllow: typeof filter = () => true;
  if (allows.length) {
    filterAllow = ([n]) => allows.includes(n.type as string);
  }

  let filterExclude: typeof filter = () => true;
  if (excludes.length) {
    filterExclude = ([n]) => !excludes.includes(n.type as string);
  }

  return !!entry && filter(entry) && filterAllow(entry) && filterExclude(entry);
};
