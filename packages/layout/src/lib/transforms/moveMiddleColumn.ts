import type { EditorUpdateTransaction, NodeEntry } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import type { TColumnGroupElement } from '@platejs/utils';

export type MoveMiddleColumnOptions = {
  direction: 'left' | 'right';
};

/**
 * Move the middle column to the left if direction is 'left', or to the right if
 * 'right'. If the middle node is empty, return false and remove it.
 */
export const moveMiddleColumn = (
  tx: EditorUpdateTransaction,
  [node, path]: NodeEntry<TColumnGroupElement>,
  options?: MoveMiddleColumnOptions
) => {
  const direction = options?.direction || 'left';

  if (direction === 'left') {
    const DESCENDANT_PATH = [1];

    const middleChildNode = NodeApi.get(node, DESCENDANT_PATH);

    if (!NodeApi.isElement(middleChildNode)) return false;

    // Check emptiness using Api.string
    const isEmpty = NodeApi.string(middleChildNode) === '';

    const middleChildPath = path.concat(DESCENDANT_PATH);

    if (isEmpty) {
      tx.nodes.remove({ at: middleChildPath });

      return false;
    }

    const firstNode = NodeApi.descendant(node, [0]);

    if (!NodeApi.isElement(firstNode)) return false;

    const appendOffset = firstNode.children.length;

    middleChildNode.children.forEach((_, childIndex) => {
      tx.nodes.move({
        at: middleChildPath.concat([0]),
        to: path.concat([0, appendOffset + childIndex]),
      });
    });
    tx.nodes.remove({ at: middleChildPath });
  }
};
