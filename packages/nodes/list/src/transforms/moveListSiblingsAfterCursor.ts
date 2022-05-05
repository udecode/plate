import {
  getNodeNode,
  match,
  moveChildren,
  PlateEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { getListTypes } from '../queries/getListTypes';

export const moveListSiblingsAfterCursor = <V extends Value>(
  editor: PlateEditor<V>,
  {
    at,
    to,
  }: {
    at: Path;
    to: Path;
  }
): number => {
  const offset = at[at.length - 1];
  at = Path.parent(at);
  const listNode = getNodeNode(editor, at);
  const listEntry: TNodeEntry = [listNode, at];

  if (
    !match(listNode, { type: getListTypes(editor) }) ||
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
