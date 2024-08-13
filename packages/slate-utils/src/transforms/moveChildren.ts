import {
  type NodeEntryOf,
  type TEditor,
  type TElement,
  getNode,
  isBlock,
  moveNodes,
} from '@udecode/slate';
import { Path } from 'slate';

export interface MoveChildrenOptions<E extends TEditor = TEditor> {
  /** Parent node of the children to move. */
  at: NodeEntryOf<E> | Path;

  /** Path where to move the children. */
  to: Path;

  /**
   * Start index of the children to move. Example: 1 means children[0] will not
   * be moved.
   */
  fromStartIndex?: number;

  /** Condition for the child to be moved */
  match?: (entry: NodeEntryOf<E>) => boolean;
}

/** Move the children of a node to a path. Returns the number of children moved. */
export const moveChildren = <E extends TEditor>(
  editor: E,
  { at, fromStartIndex = 0, match, to }: MoveChildrenOptions<E>
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
