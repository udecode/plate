import type { DescendantOf } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { InsertNodesOptions } from '../../interfaces/editor/editor-types';

export const insertNode = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  node: N,
  options?: InsertNodesOptions<ValueOf<E>>
) => editor.tf.insertNodes(node, options);
