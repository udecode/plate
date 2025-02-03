import type {
  Editor,
  ElementEntryOf,
  ElementOf,
  NodeEntry,
  TElement,
} from '@udecode/plate';

import type { GetSiblingIndentListOptions } from './getSiblingIndentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { getNextIndentList } from './getNextIndentList';
import { getPreviousIndentList } from './getPreviousIndentList';

export interface GetIndentListSiblingsOptions<
  N extends ElementOf<E>,
  E extends Editor = Editor,
> extends Partial<GetSiblingIndentListOptions<N, E>> {
  current?: boolean;
  next?: boolean;
  previous?: boolean;
}

export const getIndentListSiblings = <
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
  }: GetIndentListSiblingsOptions<N, E> = {}
) => {
  const siblings: NodeEntry[] = [];

  const node = entry[0] as TElement;

  // if (!(node as any)[IndentListPlugin.key]) return siblings;
  if (
    !node[BaseIndentListPlugin.key] &&
    !node.hasOwnProperty(INDENT_LIST_KEYS.checked)
  ) {
    return siblings;
  }

  let iterEntry = entry;

  if (previous) {
    while (true) {
      const prevEntry = getPreviousIndentList<N, E>(editor, iterEntry, options);

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
      const nextEntry = getNextIndentList(editor, iterEntry, options);

      if (!nextEntry) break;

      siblings.push(nextEntry);

      iterEntry = nextEntry;
    }
  }

  return siblings;
};
