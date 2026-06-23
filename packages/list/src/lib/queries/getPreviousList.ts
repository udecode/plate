import type { Element, NodeEntry } from '@platejs/plite';
import { NodeApi, PathApi } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the previous indent list node. */
export const getPreviousList = <N extends Element = Element>(
  editor: BasePlateEditor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>
): NodeEntry<N> | undefined =>
  getSiblingList(editor, entry, {
    getPreviousEntry: ([, currPath]) => {
      if (!PathApi.hasPrevious(currPath)) return;

      const prevPath = PathApi.previous(currPath);

      const prevNode = NodeApi.getIf(editor as any, prevPath) as N | undefined;

      if (!prevNode) return;

      return [prevNode, prevPath];
    },
    ...options,
    getNextEntry: undefined,
  });
