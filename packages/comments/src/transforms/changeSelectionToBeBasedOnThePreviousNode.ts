import { moveSelection, PlateEditor } from '@udecode/plate-core';

export const changeSelectionToBeBasedOnThePreviousNode = (
  editor: PlateEditor
) => {
  moveSelection(editor, {
    distance: 1,
    unit: 'character',
    reverse: true,
  });
  moveSelection(editor, {
    distance: 1,
    unit: 'character',
  });
};
