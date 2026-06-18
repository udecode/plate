import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { PointApi } from '../interfaces/point';

export const isEnd: EditorStaticApi['isEnd'] = (editor, point, at) => {
  const end = Editor.point(editor, at, { edge: 'end' });
  return PointApi.equals(point, end);
};
