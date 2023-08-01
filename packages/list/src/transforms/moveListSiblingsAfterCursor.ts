import {
  getNode,
  match,
  moveChildren,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
} from '@udecode/plate-common';
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
  const offset = at.at(-1)!;
  at = Path.parent(at);
  const listNode = getNode<TElement>(editor, at)!;
  const listEntry: TElementEntry = [listNode, at];

  if (
    !match(listNode, [], { type: getListTypes(editor) }) ||
    Path.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return 0;
  }

  return moveChildren(editor, {
    at: listEntry as any,
    to,
    fromStartIndex: offset + 1,
  });
};
