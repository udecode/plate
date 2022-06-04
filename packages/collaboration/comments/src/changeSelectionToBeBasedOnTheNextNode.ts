import { PlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

export function changeSelectionToBeBasedOnTheNextNode(
  editor: PlateEditor
): void {
  Transforms.move(editor, {
    distance: 1,
    unit: 'character',
  });
  Transforms.move(editor, {
    distance: 1,
    unit: 'character',
    reverse: true,
  });
}
