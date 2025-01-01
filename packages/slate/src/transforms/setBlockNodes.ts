import type {
  ElementOf,
  GetNodeEntriesOptions,
  TEditor,
  TNodeProps,
  ValueOf,
} from '../interfaces';

import { getBlocks } from '../queries/getBlocks';

export const setBlockNodes = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: GetNodeEntriesOptions<ValueOf<E>>
) => {
  editor.tf.withoutNormalizing(() => {
    const blocks = getBlocks(editor, options);

    blocks.forEach(([, path]) => {
      editor.tf.setNodes<N>(props as any, {
        at: path,
      });
    });
  });
};
