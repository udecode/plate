import { PlateEditor } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { isDocumentEnd } from '../queries/isDocumentEnd';

export function changeSelectionToBeBasedOnTheNextNode(
  editor: PlateEditor
): void {
  if (isDocumentEnd(editor)) {
    const endPoint = Editor.end(editor as any, []);
    Transforms.select(editor as any, endPoint);
  } else {
    Transforms.move(editor as any, {
      distance: 1,
      unit: 'character',
    });
    Transforms.move(editor as any, {
      distance: 1,
      unit: 'character',
      reverse: true,
    });
  }
}
