import type { InsertNodesOptions, SlateEditor, TElement } from '@udecode/plate';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';

/**
 * Insert a code block at the current selection. If the cursor is not at the
 * block start, insert break before.
 */
export const insertCodeBlock = (
  editor: SlateEditor,
  insertNodesOptions: Omit<InsertNodesOptions, 'match'> = {}
) => {
  if (!editor.selection || editor.api.isExpanded()) return;

  const matchCodeElements = (node: TElement) =>
    node.type === editor.getType(BaseCodeBlockPlugin);

  if (
    editor.api.some({
      match: matchCodeElements,
    })
  ) {
    return;
  }

  if (!editor.api.isAt({ start: true })) {
    editor.tf.insertBreak();
  }

  editor.tf.insertNodes<TElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(BaseCodeBlockPlugin),
    },
    insertNodesOptions
  );
};
