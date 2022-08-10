import { Path } from 'slate';
import {
  EElement,
  getNode,
  TEditor,
  TElement,
  Value,
  withoutNormalizing,
  wrapNodes,
  WrapNodesOptions,
} from '../slate/index';
import { Modify } from '../types/index';
import { moveChildren } from './moveChildren';

/**
 * Wrap node children into a single element:
 * - wraps the first child node into the element
 * - move the other child nodes next to the element children.
 */
export const wrapNodeChildren = <
  N extends EElement<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  element: N,
  options: Modify<WrapNodesOptions<V>, { at: Path }>
) => {
  const path = options?.at;
  const node = getNode<TElement>(editor, path);
  if (!node?.children) return;

  withoutNormalizing(editor, () => {
    const firstChildPath = path.concat([0]);

    wrapNodes(editor, element, {
      ...options,
      at: firstChildPath,
    });

    if (node.children.length < 2) return;

    moveChildren(editor, {
      at: path,
      to: firstChildPath.concat([1]),
      fromStartIndex: 1,
    });
  });
};
