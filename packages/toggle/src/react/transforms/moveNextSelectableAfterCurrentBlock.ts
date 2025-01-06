import { type SlateEditor, ElementApi } from '@udecode/plate';

import { isInClosedToggle } from '../queries';

// Return false only if all next blocks are not selectable
export const moveNextSelectableAfterCurrentBlock = (editor: SlateEditor) => {
  const { selection } = editor;

  if (!selection) return;

  const aboveBlock = editor.api.block();

  if (!aboveBlock) return;
  if (!editor.api.isAt({ end: true })) return;

  const afterPoint = editor.api.after(selection);

  if (!afterPoint) return;

  const blockAfter = editor.api.block({ at: afterPoint });

  if (!blockAfter) return;
  if (!isInClosedToggle(editor, blockAfter[0].id as string)) return; // We're already before a selectable then

  const nextSelectableBlock = editor.api.next({
    match: (node) =>
      ElementApi.isElement(node) &&
      !isInClosedToggle(editor, node.id as string),
  });

  if (!nextSelectableBlock) return false;

  const afterCurrentBlock = [aboveBlock[1][0] + 1];
  editor.tf.moveNodes({
    at: nextSelectableBlock[1],
    to: afterCurrentBlock,
  });
};
