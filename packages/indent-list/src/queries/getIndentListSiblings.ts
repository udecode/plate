import {
  EElement,
  EElementEntry,
  TEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { getNextIndentList } from './getNextIndentList';
import { getPreviousIndentList } from './getPreviousIndentList';
import { GetSiblingIndentListOptions } from './getSiblingIndentList';

export interface GetIndentListSiblingsOptions<
  N extends EElement<V>,
  V extends Value = Value
> extends Partial<GetSiblingIndentListOptions<N, V>> {
  previous?: boolean;
  current?: boolean;
  next?: boolean;
}

export const getIndentListSiblings = <
  N extends EElement<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  {
    previous = true,
    current = true,
    next = true,
    ...options
  }: GetIndentListSiblingsOptions<N, V> = {}
) => {
  const siblings: TNodeEntry[] = [];

  const [node] = entry;

  if (!(node as any)[KEY_LIST_STYLE_TYPE]) return siblings;

  let iterEntry = entry;

  if (previous) {
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

    while (true) {
      const nextEntry = getNextIndentList(editor, iterEntry, options);
      if (!nextEntry) break;

      siblings.push(nextEntry);

      iterEntry = nextEntry;
    }
  }

  return siblings;
};
