import type { InsertNodesOptions, NodeProps, SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import type { TCodeDrawingElement } from '../BaseCodeDrawingPlugin';

export const insertCodeDrawing = (
  editor: SlateEditor,
  props: NodeProps<TCodeDrawingElement> = {},
  options: InsertNodesOptions = {}
): void => {
  editor.tf.insertNodes<TCodeDrawingElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(KEYS.codeDrawing),
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
