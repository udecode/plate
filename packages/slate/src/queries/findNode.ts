import type {
  DescendantOf,
  TEditor,
  TNodeEntry,
  Value,
  ValueOf,
} from '../interfaces';
import type { GetNodeEntriesOptions } from '../interfaces/editor/editor-types';

import { getQueryOptions } from '../utils';

export type FindNodeOptions<V extends Value = Value> = GetNodeEntriesOptions<V>;

/** Find node matching the condition. */
export const findNode = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options: FindNodeOptions<ValueOf<E>> = {}
): TNodeEntry<N> | undefined => {
  options = getQueryOptions(editor, options);

  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const nodeEntries = editor.api.nodes<N>({
      ...options,
      at: options.at || editor.selection || [],
    });

    // eslint-disable-next-line no-unreachable-loop
    for (const [node, path] of nodeEntries) {
      return [node, path];
    }
  } catch (error) {
    return undefined;
  }
};
