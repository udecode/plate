import { getNodes } from '../../slate/editor/getNodes';
import { TEditor, Value } from '../../slate/types/TEditor';
import { ENode } from '../../slate/types/TNode';
import { TNodeEntry } from '../../slate/types/TNodeEntry';
import { EditorNodesOptions } from '../types/index';
import { getQueryOptions } from './match';

export type FindNodeOptions<V extends Value> = EditorNodesOptions<V>;

/**
 * Find node matching the condition.
 */
export const findNode = <V extends Value, N extends ENode<V>>(
  editor: TEditor<V>,
  options: FindNodeOptions<V> = {}
): TNodeEntry<N> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = getNodes<V, N>(editor, {
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
