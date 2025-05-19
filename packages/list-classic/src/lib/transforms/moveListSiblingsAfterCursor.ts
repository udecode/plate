import {
  type ElementEntry,
  type Path,
  type SlateEditor,
  type TElement,
  match,
  NodeApi,
  PathApi,
} from '@udecode/plate';

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
) => {
  const offset = at.at(-1)!;
  at = PathApi.parent(at);
  const listNode = NodeApi.get<TElement>(editor, at)!;
  const listEntry: ElementEntry = [listNode, at];

  if (
    !match(listNode, [], { type: getListTypes(editor) }) ||
    PathApi.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return false;
  }

  return editor.tf.moveNodes({
    at: listEntry[1],
    children: true,
    fromIndex: offset + 1,
    to,
  });
};
