import { path as editorPath } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { node } from './node';

export const last: EditorStaticApi['last'] = (editor, at) => {
  const path = editorPath(editor, at, { edge: 'end' });
  return node(editor, path);
};
