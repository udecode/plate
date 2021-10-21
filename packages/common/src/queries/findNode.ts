import { TEditor, TNode } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { EditorNodesOptions } from '../types';
import { getNodes } from './getNodes';
import { getQueryOptions } from './match';

export type FindNodeOptions<T extends TNode = TNode> = EditorNodesOptions<T>;

/**
 * Find node matching the condition.
 */
export const findNode = <T extends TNode = TNode>(
  editor: TEditor,
  options: FindNodeOptions<T> = {}
): NodeEntry<T> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = getNodes<T>(editor, {
      at: editor.selection || [],
      ...getQueryOptions(editor, options),
    });

    for (const [node, path] of nodeEntries) {
      return [node, path];
    }
  } catch (error) {
    return undefined;
  }
};
