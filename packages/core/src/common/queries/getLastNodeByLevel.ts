import { getLastNode } from '../../slate/editor/getLastNode';
import { isAncestor } from '../../slate/node/isAncestor';
import { ChildOf } from '../../slate/types/TDescendant';
import { TEditor, Value } from '../../slate/types/TEditor';
import { TNode } from '../../slate/types/TNode';
import { EDescendantEntry } from '../../slate/types/TNodeEntry';

const getLastChild = <N extends TNode>(
  node: N,
  level: number
): N | ChildOf<N> => {
  if (!(level + 1) || !isAncestor(node)) return node;

  const { children } = node;

  const lastNode = children[children.length - 1];

  return getLastChild(lastNode, level - 1) as ChildOf<N>;
};

/**
 * Get the last node at a given level.
 */
export const getLastNodeByLevel = <V extends Value>(
  editor: TEditor<V>,
  level: number
): EDescendantEntry<V> | undefined => {
  const { children } = editor;

  const lastNode = children[children.length - 1];

  if (!lastNode) return;

  const [, lastPath] = getLastNode(editor, []);

  return [
    getLastChild(lastNode, level - 1),
    lastPath.slice(0, level + 1),
  ] as EDescendantEntry<V>;
};
