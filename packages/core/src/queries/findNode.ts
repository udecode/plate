import {
  getNodeEntries,
  GetNodeEntriesOptions,
} from '../slate/editor/getNodeEntries';
import { TEditor, Value } from '../slate/editor/TEditor';
import { ENode } from '../slate/node/TNode';
import { TNodeEntry } from '../slate/node/TNodeEntry';
import { getQueryOptions } from './match';

export type FindNodeOptions<V extends Value = Value> = GetNodeEntriesOptions<V>;

/**
 * Find node matching the condition.
 */
export const findNode = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options: FindNodeOptions<V> = {}
): TNodeEntry<N> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = getNodeEntries<N, V>(editor, {
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
