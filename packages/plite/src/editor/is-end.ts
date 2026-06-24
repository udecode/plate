import { point as editorPoint } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { PointApi } from '../interfaces/point';

export const isEnd: EditorStaticApi['isEnd'] = (editor, point, at) => {
  const end = editorPoint(editor, at, { edge: 'end' });
  return PointApi.equals(point, end);
};
