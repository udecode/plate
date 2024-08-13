import {
  type ElementEntryOf,
  type ElementOf,
  type TEditor,
  type TNodeEntry,
  getNode,
} from '@udecode/plate-common';
import { Path } from 'slate';

import {
  type GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/** Get the next indent list. */
export const getNextIndentList = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingIndentListOptions<N, E>>
): TNodeEntry<N> | undefined => {
  return getSiblingIndentList(editor, entry, {
    getNextEntry: ([, currPath]) => {
      const nextPath = Path.next(currPath);
      const nextNode = getNode<N>(editor, nextPath);

      if (!nextNode) return;

      return [nextNode, nextPath];
    },
    ...options,
    getPreviousEntry: undefined,
  });
};
