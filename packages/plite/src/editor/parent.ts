import { Editor, type EditorStaticApi } from '../interfaces/editor';
import type { Ancestor, NodeEntry } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { node } from './node';

export const parent: EditorStaticApi['parent'] = (editor, at, options = {}) => {
  const path = Editor.path(editor, at, options);
  const parentPath = PathApi.parent(path);
  const entry = node(editor, parentPath);
  return entry as NodeEntry<Ancestor>;
};
