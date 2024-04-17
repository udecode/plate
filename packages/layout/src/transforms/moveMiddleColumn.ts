import {
  moveNodes,
  PlateEditor,
  removeNodes,
  TNode,
  TNodeEntry,
  unwrapNodes,
  Value,
} from '@udecode/plate-common';
import { Node } from 'slate';

import { TColumnElement } from '../types';

/**
 * @description move the middle column to the left of right by options.direction. if the middle node is empty return false and remove it.
 */
export const moveMiddleColumn = <V extends Value, N extends TNode>(
  editor: PlateEditor<V>,
  [node, path]: TNodeEntry<N>,
  options?: {
    direction: 'left' | 'right';
  }
) => {
  const direction = options?.direction || 'left';

  if (direction === 'left') {
    const DESCENDANT_PATH = [1];

    const middleChildNode = Node.get(node, DESCENDANT_PATH);
    const isEmpty = editor.isEmpty(middleChildNode as any);

    const middleChildPathRef = editor.pathRef(path.concat(DESCENDANT_PATH));

    if (isEmpty) {
      removeNodes(editor, { at: middleChildPathRef.current! });
      return false;
    }

    const firstNode = Node.descendant(node, [0]) as TColumnElement;

    const firstLast = path.concat([0, firstNode.children.length]);

    moveNodes(editor, { at: middleChildPathRef.current!, to: firstLast });
    unwrapNodes(editor, { at: middleChildPathRef.current! });
    middleChildPathRef.unref();
  }
};
