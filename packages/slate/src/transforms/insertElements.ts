import type {
  Editor,
  ElementOf,
  InsertNodesOptions,
  TElement,
  ValueOf,
} from '../interfaces';

export const insertElements = <E extends Editor>(
  editor: E,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  editor.tf.insertNodes(nodes as ElementOf<E> | ElementOf<E>[], options);
};
