import { TEditor, TNode } from '@udecode/plate-core';
import { Editor, Node, NodeEntry } from 'slate';
import { EditorNodesOptions } from '../types';
import { match } from './match';

export type FindNodeOptions<T extends TNode = TNode> = EditorNodesOptions<T>;

/**
 * Find node matching the condition.
 */
export const findNode = <T extends TNode = TNode>(
  editor: TEditor,
  options: FindNodeOptions<T>
): NodeEntry<T> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = Editor.nodes<T>(editor, {
      ...options,
      at: editor.selection || [],
      match: (node) => match<Node>(node, options.match),
    });

    for (const [node, path] of nodeEntries) {
      return [node, path];
    }
  } catch (error) {
    return undefined;
  }
};
