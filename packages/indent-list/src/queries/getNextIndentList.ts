import {
  EElement,
  EElementEntry,
  TEditor,
  TNodeEntry,
  Value,
  getNode,
} from '@udecode/plate-common';
import { Path } from 'slate';

import {
  GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/**
 * Get the next indent list.
 */
export const getNextIndentList = <
  N extends EElement<V>,
  V extends Value = Value
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
