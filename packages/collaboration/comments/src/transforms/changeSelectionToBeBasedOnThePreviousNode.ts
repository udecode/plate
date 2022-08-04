import { PlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

export function changeSelectionToBeBasedOnThePreviousNode(
  editor: PlateEditor
): void {
  Transforms.move(editor as any, {
    distance: 1,
    unit: 'character',
    reverse: true,
  });
  Transforms.move(editor as any, {
    distance: 1,
    unit: 'character',
  });
}
