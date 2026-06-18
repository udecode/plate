import {
  Editor,
  type EditorNodeOptions,
  type Editor as SlateEditor,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { NodeApi, type NodeEntry } from '../interfaces/node';

export const node = (
  editor: SlateEditor,
  at: Location,
  options: EditorNodeOptions = {}
): NodeEntry => {
  const path = Editor.path(editor, at, options);
  const node = NodeApi.get(editor, path);
  return [node, path];
};
