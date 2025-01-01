import type {
  ElementOf,
  InsertNodesOptions,
  TEditor,
  TElement,
  ValueOf,
} from '../interfaces';

export const insertElements = <E extends TEditor>(
  editor: E,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  editor.tf.insertNodes(nodes as ElementOf<E> | ElementOf<E>[], options);
};
