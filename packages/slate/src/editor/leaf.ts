import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const leaf: EditorStaticApi['leaf'] = (editor, at, options = {}) => {
  const path = Editor.path(editor, at, options);
  const node = NodeApi.leaf(editor, path);
  return [node, path];
};
