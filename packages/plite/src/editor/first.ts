import { path as editorPath } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { node } from './node';

export const first: EditorStaticApi['first'] = (editor, at) => {
  const path = editorPath(editor, at, { edge: 'start' });
  return node(editor, path);
};
