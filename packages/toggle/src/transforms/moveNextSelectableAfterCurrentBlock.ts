import {
  getBlockAbove,
  getNextNode,
  getPointAfter,
  isElement,
  isSelectionAtBlockEnd,
  moveNodes,
  PlateEditor,
} from '@udecode/plate-common';

import { isInClosedToggle } from '../queries';

// Return false only if all next blocks are not selectable
export const moveNextSelectableAfterCurrentBlock = (editor: PlateEditor) => {
  const { selection } = editor;
  if (!selection) return;
  const aboveBlock = getBlockAbove(editor);
  if (!aboveBlock) return;
  if (!isSelectionAtBlockEnd(editor)) return;
  const afterPoint = getPointAfter(editor, selection);
  if (!afterPoint) return;
  const blockAfter = getBlockAbove(editor, { at: afterPoint });
  if (!blockAfter) return;
  if (!isInClosedToggle(editor, blockAfter[0].id)) return; // We're already before a selectable then
  const nextSelectableBlock = getNextNode(editor, {
    match: (node) =>
      isElement(node) && !isInClosedToggle(editor, node.id as string),
  });
  if (!nextSelectableBlock) return false;
  const afterCurrentBlock = [aboveBlock[1][0] + 1];
  moveNodes(editor, {
    at: nextSelectableBlock[1],
    to: afterCurrentBlock,
  });
};
