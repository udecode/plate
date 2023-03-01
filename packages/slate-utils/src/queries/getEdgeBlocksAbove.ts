import { GetAboveNodeOptions } from '../slate/editor/getAboveNode';
import { getEdgePoints } from '../slate/editor/getEdgePoints';
import { TEditor, Value } from '../slate/editor/TEditor';
import { EAncestor } from '../slate/node/TAncestor';
import { TNodeEntry } from '../slate/node/TNodeEntry';
import { getBlockAbove } from './getBlockAbove';

/**
 * Get the edge blocks above a location (default: selection).
 */
export const getEdgeBlocksAbove = <
  N1 extends EAncestor<V>,
  N2 extends EAncestor<V> = N1,
  V extends Value = Value
>(
  editor: TEditor<V>,
  { at: _at, ...options }: GetAboveNodeOptions<V> = {}
): [TNodeEntry<N1>, TNodeEntry<N2>] | null => {
  const at = _at ?? editor.selection;
  if (!at) return null;

  const [start, end] = getEdgePoints(editor, at ?? editor.selection);

  const startBlock = getBlockAbove<N1>(editor, {
    at: start,
    ...options,
  });
  if (!startBlock) return null;

  const endBlock = getBlockAbove<N2>(editor, {
    at: end,
    ...options,
  });
  if (!endBlock) return null;

  return [startBlock, endBlock];
};
