import { TEditor } from '@udecode/plate-core';
import { Node, Path } from 'slate';

/**
 * Get the descendant node referred to by a specific path.
 * If the path is an empty array, it refers to the root node itself.
 * If the node is not found, return null.
 */
export const getNode = <T extends Node>(editor: TEditor, path: Path) => {
  try {
    return Node.get(editor, path) as T;
  } catch (err) {
    return null;
  }
};
