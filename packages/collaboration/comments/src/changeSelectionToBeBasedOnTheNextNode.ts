import { PlateEditor } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { isDocumentEnd } from './isDocumentEnd';

export function changeSelectionToBeBasedOnTheNextNode(
  editor: PlateEditor
): void {
  if (isDocumentEnd(editor)) {
    const endPoint = Editor.end(editor, []);
    Transforms.select(editor, endPoint);
  } else {
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
}
