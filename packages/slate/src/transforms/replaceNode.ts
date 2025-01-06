import type { Editor, ElementOrTextOf } from '../interfaces';
import type { ReplaceNodeChildrenOptions } from './replaceNodeChildren';

export const replaceNode = <
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  { at, insertOptions, nodes, removeOptions }: ReplaceNodeChildrenOptions<N, E>
) => {
  editor.tf.withoutNormalizing(() => {
    editor.tf.removeNodes({ ...removeOptions, at });

    editor.tf.insertNodes(nodes, {
      ...insertOptions,
      at,
    });
  });
};
