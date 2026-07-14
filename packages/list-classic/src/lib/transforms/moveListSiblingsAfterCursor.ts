import type { BaseEditor } from '@platejs/core';
import { type Element, type Path, PathApi } from '@platejs/plite';

import type { ListTransaction } from '../BaseListPlugin';

import { getListTypes } from '../queries/getListTypes';
import { moveListItemsToList } from './moveListItemsToList';

export const moveListSiblingsAfterCursor = (
  editor: BaseEditor,
  tx: ListTransaction,
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
  const listEntry = editor.read.nodes.get<Element>(at);

  if (
    !listEntry ||
    !getListTypes(editor).includes(listEntry[0].type) ||
    PathApi.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return false;
  }

  return moveListItemsToList(editor, tx, {
    deleteFromList: false,
    fromList: listEntry,
    fromStartIndex: offset + 1,
    to,
  });
};
