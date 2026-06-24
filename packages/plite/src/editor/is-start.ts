import { point as editorPoint } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { PointApi } from '../interfaces/point';

export const isStart: EditorStaticApi['isStart'] = (editor, point, at) => {
  const start = editorPoint(editor, at, { edge: 'start' });
  return PointApi.equals(point, start);
};
