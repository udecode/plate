import {
  type EElement,
  type EElementEntry,
  type TEditor,
  type TNodeEntry,
  type Value,
  getNode,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import {
  type GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/** Get the next indent list. */
export const getNextIndentList = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  options?: Partial<GetSiblingIndentListOptions<N, V>>
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
