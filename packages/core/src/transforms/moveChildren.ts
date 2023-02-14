import { Path } from 'slate';
import { TElement } from '../slate';
import { isBlock } from '../slate/editor/isBlock';
import { TEditor, Value } from '../slate/editor/TEditor';
import { getNode } from '../slate/node/getNode';
import { ENodeEntry } from '../slate/node/TNodeEntry';
import { moveNodes } from '../slate/transforms/moveNodes';

export interface MoveChildrenOptions<V extends Value = Value> {
  /**
   * Parent node of the children to move.
   */
  at: ENodeEntry<V> | Path;

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
  match?(entry: ENodeEntry<V>): boolean;
}

/**
 * Move the children of a node to a path.
 * Returns the number of children moved.
 */
export const moveChildren = <V extends Value>(
  editor: TEditor<V>,
  { at, to, match, fromStartIndex = 0 }: MoveChildrenOptions<V>
) => {
  let moved = 0;
  const parentPath = Path.isPath(at) ? at : at[1];
  const parentNode = Path.isPath(at) ? getNode(editor, parentPath) : at[0];

  if (!parentNode) return moved;
  if (!isBlock(editor, parentNode)) return moved;

  for (
    let i = (parentNode.children as TElement[]).length - 1;
    i >= fromStartIndex;
    i--
  ) {
    const childPath = [...parentPath, i];
    const childNode = getNode(editor, childPath);

    if (!match || (childNode && match([childNode, childPath]))) {
      moveNodes(editor, { at: childPath, to });
      moved++;
    }
  }

  return moved;
};
