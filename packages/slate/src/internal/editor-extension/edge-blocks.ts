import type {
  Editor,
  EditorAboveOptions,
  ElementOf,
  NodeEntry,
  ValueOf,
} from '../../interfaces/index';

export const edgeBlocks = <
  N1 extends ElementOf<E>,
  N2 extends ElementOf<E> = N1,
  E extends Editor = Editor,
>(
  editor: E,
  { at: _at, ...options }: EditorAboveOptions<ValueOf<E>> = {}
): [NodeEntry<N1>, NodeEntry<N2>] | null => {
  const at = _at ?? editor.selection;

  if (!at) return null;

  const [start, end] = editor.api.edges(at ?? editor.selection)!;

  const startBlock = editor.api.block<N1>({
    at: start,
    ...options,
  } as any);

  if (!startBlock) return null;

  const endBlock = editor.api.block<N2>({
    at: end,
    ...options,
  } as any);

  if (!endBlock) return null;

  return [startBlock, endBlock];
};
