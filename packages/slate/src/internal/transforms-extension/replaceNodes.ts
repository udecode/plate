import type {
  Editor,
  ElementOrTextOf,
  ReplaceNodesOptions,
  ValueOf,
} from '../../interfaces';

import { getAt } from '../../utils';

export const replaceNodes = <
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  nodes: N | N[],
  {
    at,
    children,
    removeNodes: removeOptions,
    ...options
  }: ReplaceNodesOptions<ValueOf<E>>
) => {
  editor.tf.withoutNormalizing(() => {
    if (children) {
      if (!at) return;

      at = getAt(editor, at);

      const path = editor.api.path(at!);

      if (!path) return;

      // Remove all children at path
      editor.tf.removeNodes({
        ...removeOptions,
        at: path,
        children: true,
      });

      // Insert at first child position
      editor.tf.insertNodes(nodes, {
        ...options,
        at: path.concat([0]),
      });
    } else {
      // Replace node at path
      editor.tf.removeNodes({ ...removeOptions, at });

      editor.tf.insertNodes(nodes, {
        ...options,
        at,
      });
    }
  });
};
