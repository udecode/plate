import { moveChildren } from '@udecode/slate-plugins-common';
import { Editor, Node, NodeEntry, Path } from 'slate';
import { isNodeTypeList } from '../queries/isNodeTypeList';
import { ListOptions } from '../types';

export const moveListSiblingsAfterCursor = (
  editor: Editor,
  {
    at,
    to,
  }: {
    at: Path;
    to: Path;
  },
  options?: ListOptions
): number => {
  const offset = at[at.length - 1];
  at = Path.parent(at);
  const listNode = Node.get(editor, at);
  const listEntry: NodeEntry = [listNode, at];

  if (
    !isNodeTypeList(listNode, options) ||
    Path.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return 0;
  }

  return moveChildren(editor, {
    at: listEntry,
    to,
    start: offset + 1,
  });
};
