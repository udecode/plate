import type {
  DescendantOf,
  Editor,
  EditorFindOptions,
  NodeEntry,
  ValueOf,
} from '../../interfaces';

import { getQueryOptions } from '../../utils';

export const findNode = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  options: EditorFindOptions<ValueOf<E>> = {}
): NodeEntry<N> | undefined => {
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
