import type { ElementOf, TEditor, TElement, ValueOf } from '../interfaces';
import type { InsertNodesOptions } from '../interfaces/editor/editor-types';

export const insertElements = <E extends TEditor>(
  editor: E,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  editor.tf.insertNodes(nodes as ElementOf<E> | ElementOf<E>[], options);
};
