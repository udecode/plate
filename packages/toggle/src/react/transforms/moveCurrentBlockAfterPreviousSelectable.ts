import { type SlateEditor, ElementApi } from '@udecode/plate';

import { isInClosedToggle } from '../queries';

// Return false only if the all previous blocks are not selectable
export const moveCurrentBlockAfterPreviousSelectable = (
  editor: SlateEditor
): boolean | undefined => {
  const { selection } = editor;

  if (!selection) return;

  const aboveBlock = editor.api.block();

  if (!aboveBlock) return;
  if (!editor.api.isAt({ start: true })) return;

  const beforePoint = editor.api.before(selection);

  if (!beforePoint) return;

  const blockBefore = editor.api.block({ at: beforePoint });

  if (!blockBefore) return;
  if (!isInClosedToggle(editor, blockBefore[0].id as string)) return; // We're already after a selectable then

  const previousSelectableBlock = editor.api.previous({
    match: (node) =>
      ElementApi.isElement(node) &&
      !isInClosedToggle(editor, node.id as string),
  });

  if (!previousSelectableBlock) return false;

  const afterSelectableBlock = [previousSelectableBlock[1][0] + 1];
  editor.tf.moveNodes({
    at: aboveBlock[1],
    to: afterSelectableBlock,
  });
};
