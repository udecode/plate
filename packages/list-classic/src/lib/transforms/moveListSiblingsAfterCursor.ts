import type { SlateEditor } from '@platejs/core';
import type { Element, Path } from '@platejs/slate';
import { PathApi } from '@platejs/slate';

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
  const listEntry = editor.api.node<Element>(at);

  if (!listEntry) {
    return false;
  }

  const [listNode] = listEntry;

  if (
    !getListTypes(editor).includes(listNode.type) ||
    PathApi.isParent(at, to) // avoid moving nodes within its own list
  ) {
    return false;
  }

  let moved = false;

  editor.update((tx) => {
    for (let index = listNode.children.length - 1; index > offset; index--) {
      tx.nodes.move({
        at: [...listEntry[1], index],
        to,
      });
      moved = true;
    }
  });

  return moved;
};
