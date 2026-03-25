import type { InsertNodesOptions, NodeProps, SlateEditor } from 'platejs';

import type { TCodeDrawingElement } from '../BaseCodeDrawingPlugin';
import { CODE_DRAWING_KEY } from '../BaseCodeDrawingPlugin';

export const insertCodeDrawing = (
  editor: SlateEditor,
  props: NodeProps<TCodeDrawingElement> = {},
  options: InsertNodesOptions = {}
): void => {
  const safeProps: NodeProps<TCodeDrawingElement> =
    props && typeof props === 'object'
      ? props
      : ({} as NodeProps<TCodeDrawingElement>);
  const { data: propsData, ...restProps } = safeProps;

  editor.tf.insertNodes<TCodeDrawingElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(CODE_DRAWING_KEY),
      data: {
        drawingType: 'Mermaid',
        drawingMode: 'Both',
        code: '',
        ...(typeof propsData === 'object' && propsData !== null
          ? propsData
          : {}),
      },
      ...restProps,
    },
    {
      nextBlock: true,
      ...(options && typeof options === 'object' ? options : {}),
    }
  );
};
