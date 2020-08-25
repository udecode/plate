import { Editor, Node, NodeEntry } from 'slate';
import { getBlockPathById } from '../../dnd';
import { QueryOptions } from '../types/QueryOptions.types';
import { isNodeType } from './isNodeType';

/**
 * Find the block before a block by id.
 * If not found, find the first block by id and return [null, its previous path]
 */
export const getPreviousBlockById = (
  editor: Editor,
  id: string,
  query?: QueryOptions
): NodeEntry<Node> | undefined => {
  const nodePath = getBlockPathById(editor, id);
  if (nodePath) {
    const prevEntry = Editor.previous(editor, { at: nodePath });
    if (prevEntry && prevEntry[0].id && Editor.isBlock(editor, prevEntry[0])) {
      return prevEntry;
    }
  }
  let found = false;
  const nodeEntries = [
    ...Editor.nodes(editor, {
      mode: 'highest',
      reverse: true,
      match: (n) => {
        // filter nodes that are not blocks and without id.
        if (!Editor.isBlock(editor, n) || !n.id) return false;

        // find the block then take the previous one.
        if (n.id === id) {
          found = true;
          return false;
        }

        return found && n.id !== id && isNodeType([n, []], query);
      },
      at: [],
    }),
  ];
  if (nodeEntries.length) {
    return nodeEntries[0];
  }
  if (!found) return;

  const firstNodeEntry = [
    ...Editor.nodes(editor, {
      mode: 'highest',
      match: (n) => {
        return Editor.isBlock(editor, n) && n.id && isNodeType([n, []], query);
      },
      at: [],
    }),
  ];

  if (firstNodeEntry.length) {
    const [, path] = firstNodeEntry[0];

    path[path.length - 1] = path[path.length - 1] - 1;

    return [null, path] as any;
  }
};
