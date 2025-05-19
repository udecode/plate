import type {
  Editor,
  ElementEntryOf,
  ElementOf,
  NodeEntry,
  TElement,
} from '@udecode/plate';

import type { GetSiblingListOptions } from './getSiblingList';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
import { getNextList } from './getNextList';
import { getPreviousList } from './getPreviousList';

export interface GetListSiblingsOptions<
  N extends ElementOf<E>,
  E extends Editor = Editor,
> extends Partial<GetSiblingListOptions<N, E>> {
  current?: boolean;
  next?: boolean;
  previous?: boolean;
}

export const getListSiblings = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  {
    current = true,
    next = true,
    previous = true,
    ...options
  }: GetListSiblingsOptions<N, E> = {}
) => {
  const siblings: NodeEntry[] = [];

  const node = entry[0] as TElement;

  if (
    !node[INDENT_LIST_KEYS.listStyleType] &&
    !node.hasOwnProperty(INDENT_LIST_KEYS.checked)
  ) {
    return siblings;
  }

  let iterEntry = entry;

  if (previous) {
    while (true) {
      const prevEntry = getPreviousList<N, E>(editor, iterEntry, options);

      if (!prevEntry) break;

      siblings.push(prevEntry);

      iterEntry = prevEntry;
    }
  }
  if (current) {
    siblings.push(entry);
  }
  if (next) {
    iterEntry = entry;

    while (true) {
      const nextEntry = getNextList(editor, iterEntry, options);

      if (!nextEntry) break;

      siblings.push(nextEntry);

      iterEntry = nextEntry;
    }
  }

  return siblings;
};
