import type { InsertNodesOptions, SlateEditor, TElement } from '@udecode/plate';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = (
  editor: SlateEditor,
  insertNodesOptions: Omit<InsertNodesOptions, 'match'> = {}
) => {
  if (!editor.selection || editor.api.isExpanded()) return;

  const matchCodeElements = (node: TElement) =>
    node.type === editor.getType(BaseCodeBlockPlugin) ||
    node.type === editor.getType(BaseCodeLinePlugin);

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

  editor.tf.setNodes(
    {
      children: [{ text: '' }],
      type: editor.getType(BaseCodeLinePlugin),
    },
    insertNodesOptions
  );

  editor.tf.wrapNodes<TElement>(
    {
      children: [],
      type: editor.getType(BaseCodeBlockPlugin),
    },
    insertNodesOptions
  );
};
