import { Editor, Node, NodeEntry } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { TNode } from '../../types/slate/TNode';
import { QueryNodeOptions } from '../types/QueryNodeOptions';
import { findNode } from './findNode';
import { queryNode } from './queryNode';

/**
 * Find the block before a block by id.
 * If not found, find the first block by id and return [null, its previous path]
 */
export const getPreviousBlockById = (
  editor: TEditor,
  id: string,
  query?: QueryNodeOptions
): NodeEntry<Node> | undefined => {
  const entry = findNode(editor, { match: { id } });
  if (entry) {
    const prevEntry = Editor.previous<TNode>(editor, { at: entry[1] });
    if (prevEntry && prevEntry[0].id && Editor.isBlock(editor, prevEntry[0])) {
      return prevEntry;
    }
  }
  let found = false;
  const _nodes = Editor.nodes(editor, {
    mode: 'highest',
    reverse: true,
    match: (_n) => {
      const n = _n as TNode;

      // filter nodes that are not blocks and without id.
      if (!Editor.isBlock(editor, n) || !n.id) return false;

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

  const _entries = Editor.nodes(editor, {
    mode: 'highest',
    match: (_n) => {
      const n = _n as TNode;

      return Editor.isBlock(editor, n) && !!n.id && queryNode([n, []], query);
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
