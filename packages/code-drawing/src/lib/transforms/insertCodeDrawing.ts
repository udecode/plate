import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
  NodeProps,
} from '@platejs/plite';

import type { TCodeDrawingElement } from '../BaseCodeDrawingPlugin';

export const insertCodeDrawing = (
  tx: EditorUpdateTransaction,
  type: string,
  props: NodeProps<TCodeDrawingElement> = {},
  options: NodeInsertNodesOptions<TCodeDrawingElement> = {}
): void => {
  const { data, ...restProps } = props;
  tx.blocks.insertAfter<TCodeDrawingElement>(
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
    options
  );
};
