import { Path } from 'slate';
import { getEndPoint, isEndPoint, TEditor, Value } from '../slate';

export const isDocumentEnd = <V extends Value = Value>(editor: TEditor<V>) => {
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
