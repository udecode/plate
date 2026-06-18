import { Editor, type EditorStaticApi } from '../interfaces/editor';

export const isEdge: EditorStaticApi['isEdge'] = (editor, point, at) =>
  Editor.isStart(editor, point, at) || Editor.isEnd(editor, point, at);
