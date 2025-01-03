import {
  type SlateEditor,
  type TNode,
  type TNodeEntry,
  getNode,
  getNodeDescendant,
  getNodeString,
} from '@udecode/plate-common';

import type { TColumnElement } from '../types';

/**
 * Move the middle column to the left if direction is 'left', or to the right if
 * 'right'. If the middle node is empty, return false and remove it.
 */
export const moveMiddleColumn = <N extends TNode>(
  editor: SlateEditor,
  [node, path]: TNodeEntry<N>,
  options?: {
    direction: 'left' | 'right';
  }
) => {
  const direction = options?.direction || 'left';

  if (direction === 'left') {
    const DESCENDANT_PATH = [1];

    const middleChildNode = getNode<TColumnElement>(node, DESCENDANT_PATH);

    if (!middleChildNode) return false;

    // Check emptiness using Node.string
    const isEmpty = getNodeString(middleChildNode) === '';

    const middleChildPathRef = editor.api.pathRef(path.concat(DESCENDANT_PATH));

    if (isEmpty) {
      editor.tf.removeNodes({ at: middleChildPathRef.current! });

      return false;
    }

    const firstNode = getNodeDescendant<TColumnElement>(node, [0]);

    if (!firstNode) return false;

    const firstLast = path.concat([0, firstNode.children.length]);

    editor.tf.moveNodes({ at: middleChildPathRef.current!, to: firstLast });
    editor.tf.unwrapNodes({ at: middleChildPathRef.current! });
    middleChildPathRef.unref();
  }
};
