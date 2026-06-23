import {
  Editor,
  type EditorNodeOptions,
  type Editor as PliteEditor,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { NodeApi, type NodeEntry } from '../interfaces/node';

export const node = (
  editor: PliteEditor,
  at: Location,
  options: EditorNodeOptions = {}
): NodeEntry => {
  const path = Editor.path(editor, at, options);
  const node = NodeApi.get(editor, path);
  return [node, path];
};
