import { LocationApi } from '../interfaces';
import { Editor, type EditorStaticApi } from '../interfaces/editor';

export const range: EditorStaticApi['range'] = (editor, at, to) => {
  if (LocationApi.isRange(at) && !to) {
    return at;
  }

  const start = Editor.point(editor, at, { edge: 'start' });
  const end = Editor.point(editor, to || at, { edge: 'end' });
  return { anchor: start, focus: end };
};
