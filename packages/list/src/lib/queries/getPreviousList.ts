import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  NodeApi,
  PathApi,
} from 'platejs';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the previous indent list node. */
export const getPreviousList = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingListOptions<N, E>>
): NodeEntry<N> | undefined =>
  getSiblingList(editor, entry, {
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
