import type { Editor, EditorNodesOptions, ValueOf } from '@udecode/plate';

/** Get blocks with an id */
export const getBlocksWithId = <E extends Editor>(
  editor: E,
  options: EditorNodesOptions<ValueOf<E>>
) => {
  const _nodes = editor.api.nodes({
    match: (n) => editor.api.isBlock(n) && !!n.id,
    ...options,
  });

  return Array.from(_nodes);
};
