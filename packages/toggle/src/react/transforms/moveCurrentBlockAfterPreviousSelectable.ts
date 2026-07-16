import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  ElementApi,
  PathApi,
} from '@platejs/plite';

import { isInClosedToggle } from '../queries';

// Return false only if the all previous blocks are not selectable
export const moveCurrentBlockAfterPreviousSelectable = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
): boolean | undefined => {
  const selection = tx.selection();

  if (!selection) return;

  const aboveBlock = tx.nodes.block();

  if (!aboveBlock) return;
  if (!tx.selection.isAtBlockStart()) return;

  const blockIndex = aboveBlock[1].at(-1);

  if (blockIndex === undefined || blockIndex === 0) return;

  const blockBefore = tx.nodes.get(PathApi.previous(aboveBlock[1]));

  if (!blockBefore || !ElementApi.isElement(blockBefore[0])) return;
  if (
    typeof blockBefore[0].id !== 'string' ||
    !isInClosedToggle(editor, blockBefore[0].id)
  ) {
    return;
  }

  const previousSelectableBlock = tx.nodes.previous({
    at: blockBefore[1],
    match: (node) =>
      ElementApi.isElement(node) &&
      (typeof node.id !== 'string' || !isInClosedToggle(editor, node.id)),
  });

  if (!previousSelectableBlock) return false;

  tx.nodes.move({
    at: aboveBlock[1],
    to: PathApi.next(previousSelectableBlock[1]),
  });
};
