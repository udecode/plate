import {
  type EElement,
  type QueryNodeOptions,
  type TEditor,
  type TElement,
  type TNodeEntry,
  type Value,
  findNode,
  getNodeEntries,
  getPreviousNode,
  isBlock,
  queryNode,
} from '@udecode/slate';

/**
 * Find the block before a block by id. If not found, find the first block by id
 * and return [null, its previous path]
 */
export const getPreviousBlockById = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  id: string,
  query?: QueryNodeOptions
): TNodeEntry<N> | undefined => {
  const entry = findNode(editor, {
    match: { id },
  });

  if (entry) {
    const prevEntry = getPreviousNode<TElement>(editor, { at: entry[1] });

    if (prevEntry?.[0].id && isBlock(editor, prevEntry[0])) {
      return prevEntry as TNodeEntry<N>;
    }
  }

  let found = false;
  const _nodes = getNodeEntries<N>(editor, {
    at: [],
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
    mode: 'highest',
    reverse: true,
  });
  const nodeEntries = Array.from(_nodes);

  if (nodeEntries.length > 0) {
    return nodeEntries[0];
  }
  if (!found) return;

  const _entries = getNodeEntries<TElement>(editor, {
    at: [],
    match: (n) => {
      return isBlock(editor, n) && !!n.id && queryNode([n, []], query);
    },
    mode: 'highest',
  });
  const firstNodeEntry = Array.from(_entries);

  if (firstNodeEntry.length > 0) {
    const [, path] = firstNodeEntry[0];

    path[path.length - 1] = path.at(-1)! - 1;

    return [null, path] as any;
  }
};
