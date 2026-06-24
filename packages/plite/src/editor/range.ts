import { LocationApi } from '../interfaces';
import { point as editorPoint } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';

export const range: EditorStaticApi['range'] = (editor, at, to) => {
  if (LocationApi.isRange(at) && !to) {
    return at;
  }

  const start = editorPoint(editor, at, { edge: 'start' });
  const end = editorPoint(editor, to || at, { edge: 'end' });
  return { anchor: start, focus: end };
};
