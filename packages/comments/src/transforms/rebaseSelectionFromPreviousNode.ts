import { moveSelection, PlateEditor, Value } from '@udecode/plate-core';

export const rebaseSelectionFromPreviousNode = <V extends Value = Value>(
  editor: PlateEditor<V>
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
