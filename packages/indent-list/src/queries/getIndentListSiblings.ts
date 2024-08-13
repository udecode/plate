import type {
  ElementEntryOf,
  ElementOf,
  TEditor,
  TElement,
  TNodeEntry,
} from '@udecode/plate-common';

import type { GetSiblingIndentListOptions } from './getSiblingIndentList';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';
import { getNextIndentList } from './getNextIndentList';
import { getPreviousIndentList } from './getPreviousIndentList';

export interface GetIndentListSiblingsOptions<
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
> extends Partial<GetSiblingIndentListOptions<N, E>> {
  current?: boolean;
  next?: boolean;
  previous?: boolean;
}

export const getIndentListSiblings = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
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
  const siblings: TNodeEntry[] = [];

  const node = entry[0] as TElement;

  // if (!(node as any)[KEY_LIST_STYLE_TYPE]) return siblings;
  if (!node[KEY_LIST_STYLE_TYPE] && !node.hasOwnProperty(KEY_LIST_CHECKED)) {
    return siblings;
  }

  let iterEntry = entry;

  if (previous) {
    // eslint-disable-next-line no-constant-condition
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

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextEntry = getNextIndentList(editor, iterEntry, options);

      if (!nextEntry) break;

      siblings.push(nextEntry);

      iterEntry = nextEntry;
    }
  }

  return siblings;
};
