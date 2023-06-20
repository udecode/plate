import {
  ChildOf,
  EElementOrText,
  getLastNode,
  isAncestor,
  TEditor,
  TNode,
  TNodeEntry,
  Value,
} from '@udecode/slate';

const getLastChild = <N extends ChildOf<R>, R extends TNode>(
  node: R,
  level: number
): R | N => {
  if (!(level + 1) || !isAncestor(node)) return node;

  const { children } = node;

  const lastNode = children.at(-1)!;

  return getLastChild(lastNode, level - 1) as N;
};

/**
 * Get the last node at a given level.
 */
export const getLastNodeByLevel = <
  N extends EElementOrText<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  level: number
): TNodeEntry<N> | undefined => {
  const { children } = editor;

  const lastNode = children.at(-1);

  if (!lastNode) return;

  const [, lastPath] = getLastNode(editor, []);

  return [getLastChild(lastNode, level - 1) as N, lastPath.slice(0, level + 1)];
};
