import { point as editorPoint } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';

export const edges: EditorStaticApi['edges'] = (editor, at) => [
  editorPoint(editor, at, { edge: 'start' }),
  editorPoint(editor, at, { edge: 'end' }),
];
