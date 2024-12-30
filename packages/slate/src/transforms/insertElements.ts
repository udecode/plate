import {
  type ElementOf,
  type InsertNodesOptions,
  type TEditor,
  type TElement,
  type ValueOf,
  insertNodes,
} from '../interfaces';

export const insertElements = <E extends TEditor>(
  editor: E,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  insertNodes(editor, nodes as ElementOf<E> | ElementOf<E>[], options);
};
