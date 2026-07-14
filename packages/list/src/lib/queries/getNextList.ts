import {
  type Editor,
  type Element,
  type NodeEntry,
  PathApi,
} from '@platejs/plite';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the next indent list. */
export const getNextList = <N extends Element = Element>(
  editor: Editor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>
): NodeEntry<N> | undefined =>
  getSiblingList(editor, entry, {
    getNextEntry: ([, currPath]) => {
      const nextPath = PathApi.next(currPath);
      const nextNode = editor.read.nodes.get<N>(nextPath)?.[0];

      if (!nextNode) return;

      return [nextNode, nextPath];
    },
    ...options,
    getPreviousEntry: undefined,
  });
