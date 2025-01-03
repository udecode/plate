import type { DescendantOf } from '../../interfaces';
import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { InsertNodesOptions } from '../../interfaces/editor/editor-types';

export const insertNode = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  node: N,
  options?: InsertNodesOptions<ValueOf<E>>
) => editor.tf.insertNodes(node, options);
