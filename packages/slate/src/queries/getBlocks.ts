import type {
  ElementOf,
  GetNodeEntriesOptions,
  TEditor,
  ValueOf,
} from '../interfaces';

export const getBlocks = <N extends ElementOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetNodeEntriesOptions<ValueOf<E>>
) => {
  return [
    ...editor.api.nodes<N>({
      ...options,
      block: true,
    }),
  ];
};
