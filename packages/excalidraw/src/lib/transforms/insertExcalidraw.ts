import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
  NodeProps,
} from '@platejs/plite';

import type { TExcalidrawElement } from '../BaseExcalidrawPlugin';

export const insertExcalidraw = (
  tx: EditorUpdateTransaction,
  type: string,
  props: NodeProps<TExcalidrawElement> = {},
  options: NodeInsertNodesOptions<TExcalidrawElement> = {}
): void => {
  if (!tx.selection() && options.at === undefined) return;

  tx.blocks.insertAfter<TExcalidrawElement>(
    {
      children: [{ text: '' }],
      type,
      ...props,
    },
    options
  );
};
