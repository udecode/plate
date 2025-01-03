import type { AncestorOf, TEditor, TNodeEntry, ValueOf } from '../interfaces';
import type { GetAboveNodeOptions } from '../interfaces/editor/editor-types';

import { getBlockAbove } from './getBlockAbove';

/** Get the edge blocks above a location (default: selection). */
export const getEdgeBlocksAbove = <
  N1 extends AncestorOf<E>,
  N2 extends AncestorOf<E> = N1,
  E extends TEditor = TEditor,
>(
  editor: E,
  { at: _at, ...options }: GetAboveNodeOptions<ValueOf<E>> = {}
): [TNodeEntry<N1>, TNodeEntry<N2>] | null => {
  const at = _at ?? editor.selection;

  if (!at) return null;

  const [start, end] = editor.api.edges(at ?? editor.selection)!;

  const startBlock = getBlockAbove<N1>(editor, {
    at: start,
    ...options,
  } as any);

  if (!startBlock) return null;

  const endBlock = getBlockAbove<N2>(editor, {
    at: end,
    ...options,
  } as any);

  if (!endBlock) return null;

  return [startBlock, endBlock];
};
