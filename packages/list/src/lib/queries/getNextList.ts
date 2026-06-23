import type { Element, NodeEntry } from '@platejs/slate';
import { NodeApi, PathApi } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the next indent list. */
export const getNextList = <N extends Element = Element>(
  editor: SlateEditor,
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
