import {
  isAncestor,
  TDescendant,
  TEditor,
  TNode,
} from '@udecode/slate-plugins-core';
import { Editor, NodeEntry } from 'slate';

const getLastChild = (node: TNode, level: number): TDescendant => {
  if (!(level + 1) || !isAncestor(node)) return node;

  const { children } = node;

  const lastNode = children[children.length - 1];

  return getLastChild(lastNode, level - 1);
};

/**
 * Get the last node at a given level.
 */
export const getLastNode = (
  editor: TEditor,
  level: number
): NodeEntry<TDescendant> | undefined => {
  const { children } = editor;

  const lastNode = children[children.length - 1];

  if (!lastNode) return;

  const [, lastPath] = Editor.last(editor, []);

  return [getLastChild(lastNode, level - 1), lastPath.slice(0, level + 1)];
};
