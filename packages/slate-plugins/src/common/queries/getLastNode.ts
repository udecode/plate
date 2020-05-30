import { Editor, Node, NodeEntry } from 'slate';
import { isAncestor } from './isAncestor';

const getLastChild = (node: Node, level: number): Node => {
  if (!(level + 1) || !isAncestor(node)) return node;

  const { children } = node;

  const lastNode = children[children.length - 1];

  return getLastChild(lastNode, level - 1);
};

/**
 * Get the last node at a given level.
 */
export const getLastNode = (editor: Editor, level: number): NodeEntry => {
  const { children } = editor;

  const lastNode = children[children.length - 1];

  const [, lastPath] = Editor.last(editor, []);

  return [getLastChild(lastNode, level - 1), lastPath.slice(0, level + 1)];
};
