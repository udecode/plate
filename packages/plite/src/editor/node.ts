import { path as editorPath } from '../interfaces/editor';
import type {
  EditorNodeOptions,
  Editor as EditorType,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { NodeApi, type NodeEntry } from '../interfaces/node';

export const node = (
  editor: EditorType,
  at: Location,
  options: EditorNodeOptions = {}
): NodeEntry => {
  const path = editorPath(editor, at, options);
  const node = NodeApi.get(editor, path);
  return [node, path];
};
