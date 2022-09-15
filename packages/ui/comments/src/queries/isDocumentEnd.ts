import { PlateEditor } from '@udecode/plate-core';
import { Editor, Path } from 'slate';

export const isDocumentEnd = (editor: PlateEditor) => {
  if (editor.selection) {
    const point = editor.selection.focus;
    const endPoint = Editor.end(editor as any, []);
    return (
      endPoint.offset === 0 &&
      Editor.isEnd(editor as any, point, point) &&
      Path.equals(Path.next(Path.parent(point.path)), endPoint.path)
    );
  }
  return false;
};
