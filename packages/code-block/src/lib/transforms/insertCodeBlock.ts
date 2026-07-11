import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  insertNodesOptions: Omit<NodeInsertNodesOptions<Element>, 'match'> = {}
) => {
  const selection = editor.read.selection();

  if (!selection || editor.read.selection.isExpanded()) return;

  const codeBlockType = editor.getType(KEYS.codeBlock);
  const codeLineType = editor.getType(KEYS.codeLine);
  if (
    editor.read.nodes.some({
      match: { type: [codeBlockType, codeLineType] },
    })
  ) {
    return;
  }
  if (!editor.read.selection.isAtBlockStart()) {
    tx.break.insert();
  }

  tx.nodes.set(
    {
      children: [{ text: '' }],
      type: codeLineType,
    },
    insertNodesOptions
  );

  tx.nodes.wrap(
    {
      children: [],
      type: codeBlockType,
    },
    insertNodesOptions
  );
};
