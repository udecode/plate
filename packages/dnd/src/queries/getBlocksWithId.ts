import {
  type GetNodeEntriesOptions,
  type TEditor,
  getNodeEntries,
  isBlock,
} from '@udecode/plate-common';

/** Get blocks with an id */
export const getBlocksWithId = <E extends TEditor>(
  editor: E,
  options: GetNodeEntriesOptions<E>
) => {
  const _nodes = getNodeEntries(editor, {
    match: (n) => isBlock(editor, n) && !!n.id,
    ...options,
  });

  return Array.from(_nodes);
};
