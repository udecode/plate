import { type Editor, PathApi } from '../../interfaces/index';

export const isEditorEnd = (editor: Editor) => {
  if (editor.selection) {
    const point = editor.selection.focus;
    const endPoint = editor.api.end([])!;

    return (
      endPoint.offset === 0 &&
      editor.api.isEnd(point, point) &&
      PathApi.equals(PathApi.next(PathApi.parent(point.path)), endPoint.path)
    );
  }

  return false;
};
