import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import {
  type GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/** Get the next indent list. */
export const getNextIndentList = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingIndentListOptions<N, E>>
): NodeEntry<N> | undefined => {
  return getSiblingIndentList(editor, entry, {
    getNextEntry: ([, currPath]) => {
      const nextPath = PathApi.next(currPath);
      const nextNode = NodeApi.get<N>(editor, nextPath);

      if (!nextNode) return;

      return [nextNode, nextPath];
    },
    ...options,
    getPreviousEntry: undefined,
  });
};
