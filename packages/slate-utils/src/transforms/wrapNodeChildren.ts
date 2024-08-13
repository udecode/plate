import type { Modify } from '@udecode/utils';
import type { Path } from 'slate';

import {
  type ElementOf,
  type TEditor,
  type TElement,
  type WrapNodesOptions,
  getNode,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/slate';

import { moveChildren } from './moveChildren';

/**
 * Wrap node children into a single element:
 *
 * - Wraps the first child node into the element
 * - Move the other child nodes next to the element children.
 */
export const wrapNodeChildren = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  element: N,
  options: Modify<WrapNodesOptions<E>, { at: Path }>
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
      fromStartIndex: 1,
      to: firstChildPath.concat([1]),
    });
  });
};
