import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';
import { getNode } from '../queries/getNode';

export interface MoveChildrenOptions {
  /**
   * Parent node of the children to move.
   */
  at: NodeEntry | Path;

  /**
   * Path where to move the children.
   */
  to: Path;

  /**
   * Start index of the children to move.
   * Example: 1 means children[0] will not be moved.
   */
  fromStartIndex?: number;

  /**
   * Condition for the child to be moved
   */
  match?(entry: NodeEntry): boolean;
}

/**
 * Move the children of a node to a path.
 * Returns the number of children moved.
 */
export const moveChildren = (
  editor: Editor,
  { at, to, match, fromStartIndex = 0 }: MoveChildrenOptions
) => {
  let moved = 0;
  const parentPath = Path.isPath(at) ? at : at[1];
  const parentNode = Path.isPath(at) ? Node.get(editor, parentPath) : at[0];

  if (!Editor.isBlock(editor, parentNode)) return moved;

  for (let i = parentNode.children.length - 1; i >= fromStartIndex; i--) {
    const childPath = [...parentPath, i];
    const childNode = getNode(editor, childPath);

    if (!match || (childNode && match([childNode, childPath]))) {
      Transforms.moveNodes(editor, { at: childPath, to });
      moved++;
    }
  }

  return moved;
};
