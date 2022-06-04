import { PlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

export function changeSelectionToBeBasedOnThePreviousNode(
  editor: PlateEditor
): void {
  Transforms.move(editor, {
    distance: 1,
    unit: 'character',
    reverse: true,
  });
  Transforms.move(editor, {
    distance: 1,
    unit: 'character',
  });
}
