import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the previous indent list node. */
export const getPreviousList = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingListOptions<N, E>>
): NodeEntry<N> | undefined => {
  return getSiblingList(editor, entry, {
    getPreviousEntry: ([, currPath]) => {
      const prevPath = PathApi.previous(currPath);

      if (!prevPath) return;

      const prevNode = NodeApi.get<N>(editor, prevPath);

      if (!prevNode) return;

      return [prevNode, prevPath];
    },
    ...options,
    getNextEntry: undefined,
  });
};
