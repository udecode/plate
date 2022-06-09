import { PlateEditor } from '@udecode/plate-core';
import { Editor, Path } from 'slate';

export function isDocumentEnd(editor: PlateEditor): boolean {
  if (editor.selection) {
    const point = editor.selection.focus;
    const endPoint = Editor.end(editor, []);
    return (
      endPoint.offset === 0 &&
      Editor.isEnd(editor, point, point) &&
      Path.equals(Path.next(Path.parent(point.path)), endPoint.path)
    );
  }
  return false;
}
