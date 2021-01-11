import castArray from 'lodash/castArray';
import { Editor, Node, NodeEntry } from 'slate';
import { findNode, FindNodeOptions } from './findNode';

/**
 * Get the first node with a type included in `types` at a location (default: selection).
 * TODO: optimize
 */
export const findNodeByType = <T extends Node>(
  editor: Editor,
  types: string[] | string,
  options: Omit<FindNodeOptions<T>, 'match'> = {}
): NodeEntry<T> | undefined => {
  types = castArray<string>(types);

  return findNode(editor, {
    match: (n) => types.includes(n.type as string),
    ...options,
  });
};
