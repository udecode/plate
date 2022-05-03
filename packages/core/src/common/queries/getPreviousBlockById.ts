import { getNodes } from '../../slate/editor/getNodes';
import { getPreviousNode } from '../../slate/editor/getPreviousNode';
import { isBlock } from '../../slate/editor/isBlock';
import { EDescendant } from '../../slate/types/TDescendant';
import { TEditor, Value } from '../../slate/types/TEditor';
import { ENode } from '../../slate/types/TNode';
import { TNodeEntry } from '../../slate/types/TNodeEntry';
import { QueryNodeOptions } from '../types/QueryNodeOptions';
import { findNode } from './findNode';
import { queryNode } from './queryNode';

/**
 * Find the block before a block by id.
 * If not found, find the first block by id and return [null, its previous path]
 */
export const getPreviousBlockById = <V extends Value, N extends EDescendant<V>>(
  editor: TEditor<V>,
  id: string,
  query?: QueryNodeOptions<ENode<V>>
): TNodeEntry<N> | undefined => {
  const entry = findNode<V, ENode<V>>(editor, {
    match: { id },
  });
  if (entry) {
    const prevEntry = getPreviousNode<V, N>(editor, { at: entry[1] });
    if (prevEntry && prevEntry[0].id && isBlock(editor, prevEntry[0])) {
      return prevEntry;
    }
  }
  let found = false;
  const _nodes = getNodes<V, N>(editor, {
    mode: 'highest',
    reverse: true,
    match: (n) => {
      // filter nodes that are not blocks and without id.
      if (!isBlock(editor, n) || !n.id) return false;

      // find the block then take the previous one.
      if (n.id === id) {
        found = true;
        return false;
      }

      return found && n.id !== id && queryNode([n, []], query);
    },
    at: [],
  });
  const nodeEntries = Array.from(_nodes);
  if (nodeEntries.length) {
    return nodeEntries[0];
  }
  if (!found) return;

  const _entries = getNodes<V, EDescendant<V>>(editor, {
    mode: 'highest',
    match: (n) => {
      return isBlock(editor, n) && !!n.id && queryNode([n, []], query);
    },
    at: [],
  });
  const firstNodeEntry = Array.from(_entries);

  if (firstNodeEntry.length) {
    const [, path] = firstNodeEntry[0];

    path[path.length - 1] = path[path.length - 1] - 1;

    return [null, path] as any;
  }
};
