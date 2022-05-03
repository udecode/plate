import { getNode, TEditor, TNodeEntry } from '@udecode/plate-core';
import { Path } from 'slate';
import {
  getSiblingIndentList,
  GetSiblingIndentListOptions,
} from './getSiblingIndentList';

/**
 * Get the next indent list.
 */
export const getNextIndentList = (
  editor: TEditor,
  entry: TNodeEntry,
  options?: Partial<GetSiblingIndentListOptions>
): TNodeEntry | undefined => {
  return getSiblingIndentList(editor, entry, {
    getNextEntry: ([, currPath]) => {
      const nextPath = Path.next(currPath);
      const nextNode = getNode(editor, nextPath);
      if (!nextNode) return;

      return [nextNode, nextPath];
    },
    ...options,
    getPreviousEntry: undefined,
  });
};
