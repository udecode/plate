import type { InsertNodesOptions, NodeProps, SlateEditor } from 'platejs';

import type { TCodeDrawingElement } from '../BaseCodeDrawingPlugin';
import { CODE_DRAWING_KEY } from '../BaseCodeDrawingPlugin';

export const insertCodeDrawing = (
  editor: SlateEditor,
  props: NodeProps<TCodeDrawingElement> = {},
  options: InsertNodesOptions = {}
): void => {
  editor.tf.insertNodes<TCodeDrawingElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(CODE_DRAWING_KEY),
      data: {
        drawingType: 'Mermaid',
        drawingMode: 'Both',
        code: '',
        ...(typeof props.data === 'object' && props.data !== null
          ? props.data
          : {}),
      },
      ...(props && typeof props === 'object' ? props : {}),
    },
    {
      nextBlock: true,
      ...(options && typeof options === 'object' ? options : {}),
    }
  );
};
