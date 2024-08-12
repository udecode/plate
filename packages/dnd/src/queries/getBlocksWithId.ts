import {
  type GetNodeEntriesOptions,
  type TEditor,
  type Value,
  getNodeEntries,
  isBlock,
} from '@udecode/plate-common';

/** Get blocks with an id */
export const getBlocksWithId = <V extends Value>(
  editor: TEditor<V>,
  options: GetNodeEntriesOptions<V>
) => {
  const _nodes = getNodeEntries(editor, {
    match: (n) => isBlock(editor, n) && !!n.id,
    ...options,
  });

  return Array.from(_nodes);
};
