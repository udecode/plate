import { getLastNode } from '../slate/editor/getLastNode';
import { TEditor, Value } from '../slate/editor/TEditor';
import { EElementOrText } from '../slate/element/TElement';
import { isAncestor } from '../slate/node/isAncestor';
import { ChildOf } from '../slate/node/TDescendant';
import { TNode } from '../slate/node/TNode';
import { TNodeEntry } from '../slate/node/TNodeEntry';

const getLastChild = <N extends ChildOf<R>, R extends TNode>(
  node: R,
  level: number
): R | N => {
  if (!(level + 1) || !isAncestor(node)) return node;

  const { children } = node;

  const lastNode = children[children.length - 1];

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

  const lastNode = children[children.length - 1];

  if (!lastNode) return;

  const [, lastPath] = getLastNode(editor, []);

  return [getLastChild(lastNode, level - 1) as N, lastPath.slice(0, level + 1)];
};
