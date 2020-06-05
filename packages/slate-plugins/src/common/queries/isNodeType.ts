import { Node, NodeEntry } from 'slate';
import { QueryOptions } from '../types';

/**
 * Is the node entry filling a condition.
 */
export const isNodeType = (
  entry?: NodeEntry<Node>,
  { filter = () => true, allow = [], exclude = [] }: QueryOptions = {}
) => {
  let filterAllow: typeof filter = () => true;
  if (allow.length) {
    filterAllow = ([n]) => allow.includes(n.type as string);
  }

  let filterExclude: typeof filter = () => true;
  if (exclude.length) {
    filterExclude = ([n]) => !exclude.includes(n.type as string);
  }

  return !!entry && filter(entry) && filterAllow(entry) && filterExclude(entry);
};
