import type { BaseEditor } from '@platejs/core';
import {
  PathApi,
  type EditorUpdateTransaction,
  type NodeInsertNodesOptions,
  type NodeProps,
} from '@platejs/plite';

import type { TExcalidrawElement } from '../BaseExcalidrawPlugin';

export const insertExcalidraw = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  type: string,
  props: NodeProps<TExcalidrawElement> = {},
  options: NodeInsertNodesOptions<TExcalidrawElement> = {}
): void => {
  let at = options.at;

  if (at === undefined) {
    const selection = tx.selection();

    if (!selection) return;

    const currentBlock = editor.read.nodes.block({ at: selection });

    if (!currentBlock) return;

    at = PathApi.next(currentBlock[1]);
  }

  tx.nodes.insert<TExcalidrawElement>(
    {
      children: [{ text: '' }],
      type,
      ...props,
    },
    {
      ...options,
      at,
    }
  );
};
