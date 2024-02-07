import {
  getBlockAbove,
  getPointBefore,
  getPreviousNode,
  isElement,
  isSelectionAtBlockStart,
  moveNodes,
  PlateEditor,
} from '@udecode/plate-common';

import { isInClosedToggle } from '../queries';

// Return false only if the all previous blocks are not selectable
export const moveCurrentBlockAfterPreviousSelectable = (
  editor: PlateEditor
): boolean | undefined => {
  const { selection } = editor;
  if (!selection) return;
  const aboveBlock = getBlockAbove(editor);
  if (!aboveBlock) return;
  if (!isSelectionAtBlockStart(editor)) return;
  const beforePoint = getPointBefore(editor, selection);
  if (!beforePoint) return;
  const blockBefore = getBlockAbove(editor, { at: beforePoint });
  if (!blockBefore) return;
  if (!isInClosedToggle(editor, blockBefore[0].id)) return; // We're already after a selectable then
  const previousSelectableBlock = getPreviousNode(editor, {
    match: (node) =>
      isElement(node) && !isInClosedToggle(editor, node.id as string),
  });
  if (!previousSelectableBlock) return false;
  const afterSelectableBlock = [previousSelectableBlock[1][0] + 1];
  moveNodes(editor, {
    at: aboveBlock[1],
    to: afterSelectableBlock,
  });
};
