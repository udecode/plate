import { getNode, getPreviousPath, TEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import {
  getSiblingIndentList,
  GetSiblingIndentListOptions,
} from './getSiblingIndentList';

/**
 * Get the previous indent list node.
 */
export const getPreviousIndentList = (
  editor: TEditor,
  entry: NodeEntry,
  options?: Partial<GetSiblingIndentListOptions>
): NodeEntry | undefined => {
  return getSiblingIndentList(editor, entry, {
    getPreviousEntry: ([, currPath]) => {
      const prevPath = getPreviousPath(currPath);
      if (!prevPath) return;

      const prevNode = getNode(editor, prevPath);
      if (!prevNode) return;

      return [prevNode, prevPath];
    },
    ...options,
    getNextEntry: undefined,
  });
};
