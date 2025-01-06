import {
  type ElementEntry,
  type Path,
  type SlateEditor,
  type TElement,
  NodeApi,
  PathApi,
  match,
  moveChildren,
} from '@udecode/plate-common';

import { getListTypes } from '../queries/getListTypes';

export const moveListSiblingsAfterCursor = (
  editor: SlateEditor,
  {
    at,
    to,
  }: {
    at: Path;
    to: Path;
  }
): number => {
  const offset = at.at(-1)!;
  at = PathApi.parent(at);
  const listNode = NodeApi.get<TElement>(editor, at)!;
  const listEntry: ElementEntry = [listNode, at];

  if (
    !match(listNode, [], { type: getListTypes(editor) }) ||
    PathApi.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return 0;
  }

  return moveChildren(editor, {
    at: listEntry as any,
    fromStartIndex: offset + 1,
    to,
  });
};
