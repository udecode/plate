import { path as editorPath } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const leaf: EditorStaticApi['leaf'] = (editor, at, options = {}) => {
  const path = editorPath(editor, at, options);
  const node = NodeApi.leaf(editor, path);
  return [node, path];
};
