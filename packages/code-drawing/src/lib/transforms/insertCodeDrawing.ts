import type { BaseEditor } from '@platejs/core';
import {
  PathApi,
  type EditorUpdateTransaction,
  type NodeInsertNodesOptions,
  type NodeProps,
} from '@platejs/plite';

import type { TCodeDrawingElement } from '../BaseCodeDrawingPlugin';

export const insertCodeDrawing = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  type: string,
  props: NodeProps<TCodeDrawingElement> = {},
  options: NodeInsertNodesOptions<TCodeDrawingElement> = {}
): void => {
  const { data, ...restProps } = props;
  const currentBlock =
    options.at === undefined
      ? editor.read.nodes.block({ at: tx.selection() ?? undefined })
      : undefined;

  tx.nodes.insert<TCodeDrawingElement>(
    {
      children: [{ text: '' }],
      type,
      data: {
        drawingType: 'Mermaid',
        drawingMode: 'Both',
        code: '',
        ...(data ?? {}),
      },
      ...restProps,
    },
    {
      ...options,
      at:
        options.at ??
        (currentBlock ? PathApi.next(currentBlock[1]) : undefined),
    }
  );
};
