import type { Path } from '../interfaces/path';

import {
  type Editor,
  type NodeEntryOf,
  type TElement,
  NodeApi,
  PathApi,
} from '../interfaces';

export interface MoveChildrenOptions<E extends Editor = Editor> {
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
export const moveChildren = <E extends Editor>(
  editor: E,
  { at, fromStartIndex = 0, match, to }: MoveChildrenOptions<E>
) => {
  let moved = 0;
  const parentPath = PathApi.isPath(at) ? at : at[1];
  const parentNode = PathApi.isPath(at)
    ? NodeApi.get(editor, parentPath)
    : at[0];

  if (!parentNode) return moved;
  if (!editor.api.isBlock(parentNode)) return moved;

  for (
    let i = (parentNode.children as TElement[]).length - 1;
    i >= fromStartIndex;
    i--
  ) {
    const childPath = [...parentPath, i];
    const childNode = NodeApi.get(editor, childPath);

    if (!match || (childNode && match([childNode, childPath]))) {
      editor.tf.moveNodes({ at: childPath, to });
      moved++;
    }
  }

  return moved;
};
