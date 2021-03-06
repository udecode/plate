import { Editor, Node, NodeEntry, Path } from 'slate';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { match } from '../../../common/utils/match';
import { getListTypes } from '../queries/getListTypes';
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
    !match(listNode, { type: getListTypes(options) }) ||
    Path.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return 0;
  }

  return moveChildren(editor, {
    at: listEntry,
    to,
    fromStartIndex: offset + 1,
  });
};
