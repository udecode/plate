import type { NodeInsertNodesOptions, NodeProps, SlateEditor } from 'platejs';
import { PathApi } from 'platejs';

import type { CodeDrawingElement } from '../BaseCodeDrawingPlugin';
import { CODE_DRAWING_KEY } from '../BaseCodeDrawingPlugin';

export type InsertCodeDrawingOptions = NonNullable<
  NodeInsertNodesOptions<CodeDrawingElement>
>;

export const insertCodeDrawing = (
  editor: SlateEditor,
  props: NodeProps<CodeDrawingElement> = {},
  options: InsertCodeDrawingOptions = {}
): void => {
  const safeProps: NodeProps<CodeDrawingElement> =
    props && typeof props === 'object'
      ? props
      : ({} as NodeProps<CodeDrawingElement>);
  const { data: propsData, ...restProps } = safeProps;
  const at = options.at ?? editor.selection ?? undefined;
  const blockEntry = at
    ? editor.api.above({ at: editor.api.end(at), block: true })
    : undefined;
  const insertOptions = {
    ...options,
    at: blockEntry ? PathApi.next(blockEntry[1]) : options.at,
  };

  editor.update((tx) => {
    tx.nodes.insert<CodeDrawingElement>(
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
      insertOptions
    );
  });
};
