import type {
  ElementOf,
  GetNodeEntriesOptions,
  TEditor,
  TNodeProps,
} from '@udecode/slate';

import { getBlocks } from '../queries/getBlocks';

export const setBlockNodes = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: GetNodeEntriesOptions<E>
) => {
  editor.withoutNormalizing(() => {
    const blocks = getBlocks(editor, options);

    blocks.forEach(([, path]) => {
      editor.setNodes<N>(props as any, {
        at: path,
      });
    });
  });
};
