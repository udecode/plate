import {
  type GetNodeEntriesOptions,
  type NodeOf,
  type TEditor,
  type TNodeEntry,
  getNodeEntries,
} from '../interfaces';
import { getQueryOptions } from '../utils';

export type FindNodeOptions<E extends TEditor = TEditor> =
  GetNodeEntriesOptions<E>;

/** Find node matching the condition. */
export const findNode = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options: FindNodeOptions<E> = {}
): TNodeEntry<N> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = getNodeEntries<N, E>(editor, {
      at: editor.selection || [],
      ...getQueryOptions(editor, options),
    });

    // eslint-disable-next-line no-unreachable-loop
    for (const [node, path] of nodeEntries) {
      return [node, path];
    }
  } catch (error) {
    return undefined;
  }
};
