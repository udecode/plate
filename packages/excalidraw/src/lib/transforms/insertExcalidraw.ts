import type {
  InsertNodesOptions,
  NodeProps,
  SlateEditor,
} from '@udecode/plate';

import {
  type TExcalidrawElement,
  BaseExcalidrawPlugin,
} from '../BaseExcalidrawPlugin';

export const insertExcalidraw = (
  editor: SlateEditor,
  props: NodeProps<TExcalidrawElement> = {},
  options: InsertNodesOptions = {}
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;

  editor.tf.insertNodes<TExcalidrawElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(BaseExcalidrawPlugin),
      ...props,
    },
    { at: path, nextBlock: true, ...(options as any) }
  );
};
