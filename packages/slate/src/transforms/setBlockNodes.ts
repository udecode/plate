import type { ElementOf, TEditor, TNodeProps, ValueOf } from '../interfaces';
import type { GetNodeEntriesOptions } from '../interfaces/editor/editor-types';

export const setBlockNodes = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: GetNodeEntriesOptions<ValueOf<E>>
) => {
  editor.tf.withoutNormalizing(() => {
    const blocks = editor.api.blocks(options);

    blocks.forEach(([, path]) => {
      editor.tf.setNodes<N>(props as any, {
        at: path,
      });
    });
  });
};
