import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  NodeApi,
  PathApi,
} from 'platejs';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the next indent list. */
export const getNextList = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingListOptions<N, E>>
): NodeEntry<N> | undefined =>
  getSiblingList(editor, entry, {
    getNextEntry: ([, currPath]) => {
      const nextPath = PathApi.next(currPath);
      const nextNode = NodeApi.get<N>(editor, nextPath);

      if (!nextNode) return;

      return [nextNode, nextPath];
    },
    ...options,
    getPreviousEntry: undefined,
  });
