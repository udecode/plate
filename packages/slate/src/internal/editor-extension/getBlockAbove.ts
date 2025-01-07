import type {
  AncestorOf,
  Editor,
  EditorAboveOptions,
  ValueOf,
} from '../../interfaces/index';

export const getBlockAbove = <
  N extends AncestorOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options: EditorAboveOptions<ValueOf<E>> = {}
) =>
  editor.api.above<N>({
    ...options,
    block: true,
  });
