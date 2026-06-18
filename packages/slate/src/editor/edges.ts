import { Editor, type EditorStaticApi } from '../interfaces/editor';

export const edges: EditorStaticApi['edges'] = (editor, at) => [
  Editor.point(editor, at, { edge: 'start' }),
  Editor.point(editor, at, { edge: 'end' }),
];
