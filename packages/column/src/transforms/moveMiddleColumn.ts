import {
  moveNodes,
  PlateEditor,
  TNode,
  TNodeEntry,
  unwrapNodes,
  Value,
} from '@udecode/plate-common';
import { Node } from 'slate';

import { TColumnElement } from '../types';

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

    const middleChildPath = editor.pathRef(path.concat(DESCENDANT_PATH));
    const firstNode = Node.descendant(node, [0]) as TColumnElement;

    const firstLast = path.concat([0, firstNode.children.length]);

    moveNodes(editor, { at: middleChildPath.current!, to: firstLast });
    unwrapNodes(editor, { at: middleChildPath.current! });
    middleChildPath.unref();
  }
};
