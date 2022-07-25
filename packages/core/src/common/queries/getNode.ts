import { Node, Path, Text } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

/**
 * Get the descendant node referred to by a specific path.
 * If the path is an empty array, it refers to the root node itself.
 * If the node is not found, return null.
 * Based on Slate get and has, performance optimization without overhead of
 * stringify on throwing
 */
export const getNode = <T extends Node>(editor: TEditor, path: Path) => {
  for (let i = 0; i < path.length; i++) {
    const p = path[i]

    if (Text.isText(editor) || !editor.children[p]) {
      return null;
    }

    editor = editor.children[p];
  }

  return editor as T;
};
