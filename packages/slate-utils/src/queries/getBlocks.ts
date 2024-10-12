import {
  type ElementOf,
  type GetNodeEntriesOptions,
  type TEditor,
  getNodeEntries,
} from '@udecode/slate';

export const getBlocks = <N extends ElementOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetNodeEntriesOptions<E>
) => {
  return [
    ...getNodeEntries<N>(editor, {
      ...options,
      block: true,
    }),
  ];
};
