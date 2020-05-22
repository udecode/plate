import { QueryOptions } from 'common/types';
import { Node } from 'slate';

export const isNodeType = (
  node: Node,
  { filter = () => true, allow = [], exclude = [] }: QueryOptions = {}
) => {
  let filterAllow: typeof filter = () => true;
  if (allow.length) {
    filterAllow = (n) => allow.includes(n.type as string);
  }

  let filterExclude: typeof filter = () => true;
  if (exclude.length) {
    filterExclude = (n) => !exclude.includes(n.type as string);
  }

  return filter(node) && filterAllow(node) && filterExclude(node);
};
