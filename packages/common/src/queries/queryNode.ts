import { TNode } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Node, NodeEntry } from 'slate';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

/**
 * Query the node entry.
 */
export const queryNode = <T extends Node>(
  entry?: NodeEntry<T>,
  { filter = () => true, allow = [], exclude = [] }: QueryNodeOptions = {}
) => {
  const allows = castArray(allow);
  const excludes = castArray(exclude);

  let filterAllow: typeof filter = () => true;
  if (allows.length) {
    filterAllow = ([n]) => allows.includes(n.type);
  }

  let filterExclude: typeof filter = () => true;
  if (excludes.length) {
    filterExclude = ([n]) => !excludes.includes(n.type);
  }

  const _entry = entry as NodeEntry<TNode>;
  return (
    !!_entry && filter(_entry) && filterAllow(_entry) && filterExclude(_entry)
  );
};
