import {
  type ElementOf,
  type InsertNodesOptions,
  type TEditor,
  type TElement,
  insertNodes,
} from '@udecode/slate';

export const insertElements = <E extends TEditor>(
  editor: E,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<E>
) => {
  insertNodes(editor, nodes as ElementOf<E> | ElementOf<E>[], options);
};
