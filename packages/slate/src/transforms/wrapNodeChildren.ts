import type { Modify } from '@udecode/utils';

import type { Path } from '../interfaces/path';

import {
  type Editor,
  type ElementOf,
  type TElement,
  type ValueOf,
  type WrapNodesOptions,
  NodeApi,
} from '../interfaces';
import { moveChildren } from './moveChildren';

/**
 * Wrap node children into a single element:
 *
 * - Wraps the first child node into the element
 * - Move the other child nodes next to the element children.
 */
export const wrapNodeChildren = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  element: N,
  options: Modify<WrapNodesOptions<ValueOf<E>>, { at: Path }>
) => {
  const path = options?.at;
  const node = NodeApi.get<TElement>(editor, path);

  if (!node?.children) return;

  editor.tf.withoutNormalizing(() => {
    const firstChildPath = path.concat([0]);

    editor.tf.wrapNodes(element, {
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
