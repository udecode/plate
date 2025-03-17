import {
  type NodeEntry,
  type SlateEditor,
  type TNode,
  NodeApi,
} from '@udecode/plate';

import type { TColumnElement } from '../types';

/**
 * Move the middle column to the left if direction is 'left', or to the right if
 * 'right'. If the middle node is empty, return false and remove it.
 */
export const moveMiddleColumn = <N extends TNode>(
  editor: SlateEditor,
  [node, path]: NodeEntry<N>,
  options?: {
    direction: 'left' | 'right';
  }
) => {
  const direction = options?.direction || 'left';

  if (direction === 'left') {
    const DESCENDANT_PATH = [1];

    const middleChildNode = NodeApi.get<TColumnElement>(node, DESCENDANT_PATH);

    if (!middleChildNode) return false;

    // Check emptiness using Api.string
    const isEmpty = NodeApi.string(middleChildNode) === '';

    const middleChildPathRef = editor.api.pathRef(path.concat(DESCENDANT_PATH));

    if (isEmpty) {
      editor.tf.removeNodes({ at: middleChildPathRef.current! });

      return false;
    }

    const firstNode = NodeApi.descendant<TColumnElement>(node, [0]);

    if (!firstNode) return false;

    const firstLast = path.concat([0, firstNode.children.length]);

    editor.tf.moveNodes({ at: middleChildPathRef.current!, to: firstLast });
    editor.tf.unwrapNodes({ at: middleChildPathRef.current! });
    middleChildPathRef.unref();
  }
};
