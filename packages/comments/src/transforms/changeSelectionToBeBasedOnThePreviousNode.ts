import { PlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

export const changeSelectionToBeBasedOnThePreviousNode = (
  editor: PlateEditor
) => {
  Transforms.move(editor as any, {
    distance: 1,
    unit: 'character',
    reverse: true,
  });
  Transforms.move(editor as any, {
    distance: 1,
    unit: 'character',
  });
};
