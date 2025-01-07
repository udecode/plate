import type {
  Editor,
  EditorNodesOptions,
  ElementOf,
  ValueOf,
} from '../../interfaces/index';

export const blocks = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: EditorNodesOptions<ValueOf<E>>
) => {
  return [
    ...editor.api.nodes<N>({
      ...options,
      block: true,
    }),
  ];
};
