import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { node } from './node';

export const last: EditorStaticApi['last'] = (editor, at) => {
  const path = Editor.path(editor, at, { edge: 'end' });
  return node(editor, path);
};
