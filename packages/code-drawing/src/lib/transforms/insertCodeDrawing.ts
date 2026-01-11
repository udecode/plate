import type { InsertNodesOptions, NodeProps, SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import type { TCodeDrawingElement } from '../BaseCodeDrawingPlugin';

export const insertCodeDrawing = (
  editor: SlateEditor,
  props: NodeProps<TCodeDrawingElement> = {},
  options: InsertNodesOptions = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;

  editor.tf.insertNodes<TCodeDrawingElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(KEYS.codeDrawing),
      data: {
        drawingType: 'Mermaid',
        drawingMode: 'Both',
        code: '',
        ...props.data,
      },
      ...props,
    },
    { at: path, nextBlock: true, ...(options as any) }
  );
};
