import type {
  DescendantOf,
  Editor,
  EditorNodesOptions,
  NodeEntry,
  ValueOf,
} from '../../interfaces';

export const findNode = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  options: EditorNodesOptions<ValueOf<E>> = {}
): NodeEntry<N> | undefined => {
  try {
    const nodeEntries = editor.api.nodes<N>(options);

    return nodeEntries.next().value as any;
  } catch (error) {
    return undefined;
  }
};
