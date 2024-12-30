import {
  type ElementOf,
  type GetNodeEntriesOptions,
  type TEditor,
  type ValueOf,
  getNodeEntries,
} from '../interfaces';

export const getBlocks = <N extends ElementOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetNodeEntriesOptions<ValueOf<E>>
) => {
  return [
    ...getNodeEntries<N, E>(editor, {
      ...options,
      block: true,
    }),
  ];
};
