import {
  getEndPoint,
  isEndPoint,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';

export const isDocumentEnd = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  if (editor.selection) {
    const point = editor.selection.focus;
    const endPoint = getEndPoint(editor, []);

    return (
      endPoint.offset === 0 &&
      isEndPoint(editor, point, point) &&
      Path.equals(Path.next(Path.parent(point.path)), endPoint.path)
    );
  }

  return false;
};
