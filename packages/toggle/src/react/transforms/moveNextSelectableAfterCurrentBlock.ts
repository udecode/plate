import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  ElementApi,
  PathApi,
} from '@platejs/plite';

import { isInClosedToggle } from '../queries';

// Return false only if all next blocks are not selectable
export const moveNextSelectableAfterCurrentBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const selection = tx.selection();

  if (!selection) return;

  const aboveBlock = tx.nodes.block();

  if (!aboveBlock) return;
  if (!tx.points.isEnd(selection.anchor, aboveBlock[1])) return;

  const blockAfter = tx.nodes.get(PathApi.next(aboveBlock[1]));

  if (!blockAfter || !ElementApi.isElement(blockAfter[0])) return;
  if (
    typeof blockAfter[0].id !== 'string' ||
    !isInClosedToggle(editor, blockAfter[0].id)
  ) {
    return;
  }

  const nextSelectableBlock = tx.nodes.next({
    at: blockAfter[1],
    match: (node) =>
      ElementApi.isElement(node) &&
      (typeof node.id !== 'string' || !isInClosedToggle(editor, node.id)),
  });

  if (!nextSelectableBlock) return false;

  tx.nodes.move({
    at: nextSelectableBlock[1],
    to: PathApi.next(aboveBlock[1]),
  });
};
