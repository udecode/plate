import {
  type GetNodeEntriesOptions,
  type TEditor,
  getNodeEntries,
  isBlockWithId,
} from '@udecode/plate-common';

/** Get blocks with an id */
export const getBlocksWithId = <E extends TEditor>(
  editor: E,
  options: GetNodeEntriesOptions<E>
) => {
  const _nodes = getNodeEntries(editor, {
    match: (n) => isBlockWithId(editor, n),
    ...options,
  });

  return Array.from(_nodes);
};
