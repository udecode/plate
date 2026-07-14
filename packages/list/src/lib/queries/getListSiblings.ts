import type { Editor, Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { GetSiblingListOptions } from './getSiblingList';

import { getNextList } from './getNextList';
import { getPreviousList } from './getPreviousList';

export interface GetListSiblingsOptions<N extends Element = Element>
  extends Partial<GetSiblingListOptions<N>> {
  current?: boolean;
  next?: boolean;
  previous?: boolean;
}

export const getListSiblings = <N extends Element = Element>(
  editor: Editor,
  entry: NodeEntry<Element>,
  {
    current = true,
    next = true,
    previous = true,
    ...options
  }: GetListSiblingsOptions<N> = {}
) => {
  const siblings: NodeEntry<Element>[] = [];
  const node = entry[0];

  if (!node[KEYS.listType] && !Object.hasOwn(node, KEYS.listChecked)) {
    return siblings;
  }

  let iterEntry = entry;

  if (previous) {
    while (true) {
      const prevEntry = getPreviousList<N>(editor, iterEntry, options);

      if (!prevEntry) break;

      siblings.push(prevEntry);
      iterEntry = prevEntry;
    }
  }
  if (current) siblings.push(entry);
  if (next) {
    iterEntry = entry;

    while (true) {
      const nextEntry = getNextList<N>(editor, iterEntry, options);

      if (!nextEntry) break;

      siblings.push(nextEntry);
      iterEntry = nextEntry;
    }
  }

  return siblings;
};
