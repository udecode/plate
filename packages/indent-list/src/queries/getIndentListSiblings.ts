import type {
  EElement,
  EElementEntry,
  TEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-common/server';

import type { GetSiblingIndentListOptions } from './getSiblingIndentList';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';
import { getNextIndentList } from './getNextIndentList';
import { getPreviousIndentList } from './getPreviousIndentList';

export interface GetIndentListSiblingsOptions<
  N extends EElement<V>,
  V extends Value = Value,
> extends Partial<GetSiblingIndentListOptions<N, V>> {
  current?: boolean;
  next?: boolean;
  previous?: boolean;
}

export const getIndentListSiblings = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  {
    current = true,
    next = true,
    previous = true,
    ...options
  }: GetIndentListSiblingsOptions<N, V> = {}
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
      const prevEntry = getPreviousIndentList<N, V>(editor, iterEntry, options);

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
