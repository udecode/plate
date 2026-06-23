import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { PointApi } from '../interfaces/point';

export const isStart: EditorStaticApi['isStart'] = (editor, point, at) => {
  const start = Editor.point(editor, at, { edge: 'start' });
  return PointApi.equals(point, start);
};
