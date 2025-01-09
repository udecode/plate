import type { DescendantOf, InsertNodesOptions } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor';

export const insertNode = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  node: N,
  options?: InsertNodesOptions<ValueOf<E>>
) => editor.tf.insertNodes(node, options);
