import type {
  GetNodeEntriesOptions,
  TEditor,
  ValueOf,
} from '@udecode/plate-common';

/** Get blocks with an id */
export const getBlocksWithId = <E extends TEditor>(
  editor: E,
  options: GetNodeEntriesOptions<ValueOf<E>>
) => {
  const _nodes = editor.api.nodes({
    match: (n) => editor.api.isBlock(n) && !!n.id,
    ...options,
  });

  return Array.from(_nodes);
};
