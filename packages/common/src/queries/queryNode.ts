import castArray from 'lodash/castArray';
import { NodeEntry } from 'slate';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

/**
 * Query the node entry.
 */
export const queryNode = (
  entry?: NodeEntry,
  { filter = () => true, allow = [], exclude = [] }: QueryNodeOptions = {}
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
