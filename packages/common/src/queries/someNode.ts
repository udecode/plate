import { Editor, Node } from 'slate';
import { findNode, FindNodeOptions } from './findNode';

/**
 * Iterate through all of the nodes in the editor and break early for the first truthy match. Otherwise
 * returns false.
 */
export const someNode = <T extends Node = Node>(
  editor: Editor,
  options: FindNodeOptions<T>
) => {
  return !!findNode<T>(editor, options);
};
