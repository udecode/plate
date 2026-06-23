import type { EditorUpdateTransaction, Element } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

type InsertNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
>;

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = (
  editor: BasePlateEditor,
  insertNodesOptions: Omit<InsertNodesOptions, 'match'> = {}
) => {
  if (!editor.selection || editor.api.isExpanded()) return;

  const matchCodeElements = (node: Element) =>
    node.type === KEYS.codeBlock || node.type === KEYS.codeLine;

  if (
    editor.api.some({
      match: matchCodeElements,
    })
  ) {
    return;
  }
  if (!editor.api.isAt({ start: true })) {
    editor.update((tx) => {
      tx.break.insert();
    });
  }

  editor.update((tx) => {
    tx.nodes.set(
      {
        children: [{ text: '' }],
        type: KEYS.codeLine,
      },
      insertNodesOptions
    );

    tx.nodes.wrap(
      {
        children: [],
        type: KEYS.codeBlock,
      },
      insertNodesOptions
    );
  });
};
