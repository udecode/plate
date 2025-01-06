import { Path } from 'slate';

import type { Editor } from '../../interfaces/index';

export const isEditorEnd = (editor: Editor) => {
  if (editor.selection) {
    const point = editor.selection.focus;
    const endPoint = editor.api.end([])!;

    return (
      endPoint.offset === 0 &&
      editor.api.isEnd(point, point) &&
      Path.equals(Path.next(Path.parent(point.path)), endPoint.path)
    );
  }

  return false;
};
