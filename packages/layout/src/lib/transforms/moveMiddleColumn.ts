import {
  type NodeEntry,
  type TColumnElement,
  type TColumnGroupElement,
  NodeApi,
} from 'platejs';

import type { ColumnEditor } from './ColumnEditor';

/**
 * Move the middle column to the left if direction is 'left', or to the right if
 * 'right'. If the middle node is empty, return false and remove it.
 */
export const moveMiddleColumn = (
  editor: ColumnEditor,
  [node, path]: NodeEntry<TColumnGroupElement>,
  options?: {
    direction: 'left' | 'right';
  }
) => {
  const direction = options?.direction || 'left';

  if (direction === 'left') {
    const DESCENDANT_PATH = [1];

    const middleChildNode = NodeApi.get(
      node,
      DESCENDANT_PATH
    ) as TColumnElement;

    if (!middleChildNode) return false;

    // Check emptiness using Api.string
    const isEmpty = NodeApi.string(middleChildNode) === '';

    const middleChildPathRef = editor.api.pathRef(path.concat(DESCENDANT_PATH));

    if (isEmpty) {
      editor.update((tx) => {
        tx.nodes.remove({ at: middleChildPathRef.current! });
      });
      middleChildPathRef.unref();

      return false;
    }

    const firstNode = NodeApi.descendant(node, [0]) as TColumnElement;

    if (!firstNode) return false;

    editor.update((tx) => {
      const appendOffset = firstNode.children.length;

      middleChildNode.children.forEach((_, childIndex) => {
        tx.nodes.move({
          at: middleChildPathRef.current!.concat([0]),
          to: path.concat([0, appendOffset + childIndex]),
        });
      });
      tx.nodes.remove({ at: middleChildPathRef.current! });
    });
    middleChildPathRef.unref();
  }
};
