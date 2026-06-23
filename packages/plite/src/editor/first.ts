import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { node } from './node';

export const first: EditorStaticApi['first'] = (editor, at) => {
  const path = Editor.path(editor, at, { edge: 'start' });
  return node(editor, path);
};
