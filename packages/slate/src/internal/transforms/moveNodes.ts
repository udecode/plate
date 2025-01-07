import { moveNodes as moveNodesBase } from 'slate';

import {
  type Editor,
  type MoveNodesOptions,
  type TElement,
  type ValueOf,
  NodeApi,
} from '../../interfaces';
import { getQueryOptions } from '../../utils';

export const moveNodes = <E extends Editor>(
  editor: E,
  { children, fromIndex = 0, ...opt }: MoveNodesOptions<ValueOf<E>>
) => {
  const options = getQueryOptions(editor, opt);

  let moved = false;

  if (children) {
    if (!options.at) return moved;

    const entry = editor.api.node(options.at!);

    if (!entry) return moved;

    const [node, path] = entry;

    if (!editor.api.isBlock(node)) return moved;

    for (
      let i = (node.children as TElement[]).length - 1;
      i >= fromIndex;
      i--
    ) {
      const childPath = [...path, i];
      const childNode = NodeApi.get(editor, childPath);

      if (
        !options.match ||
        (childNode && options.match(childNode, childPath))
      ) {
        moveNodesBase(editor as any, {
          ...options,
          at: childPath,
        });
        moved = true;
      }
    }

    return moved;
  }

  return moveNodesBase(editor as any, options);
};
