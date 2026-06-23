import type { Element, NodeEntry } from '@platejs/plite';
import { NodeApi, PathApi } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the next indent list. */
export const getNextList = <N extends Element = Element>(
  editor: BasePlateEditor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>
): NodeEntry<N> | undefined =>
  getSiblingList(editor, entry, {
    getNextEntry: ([, currPath]) => {
      const nextPath = PathApi.next(currPath);
      const nextNode = NodeApi.getIf(editor as any, nextPath) as N | undefined;

      if (!nextNode) return;

      return [nextNode, nextPath];
    },
    ...options,
    getPreviousEntry: undefined,
  });
