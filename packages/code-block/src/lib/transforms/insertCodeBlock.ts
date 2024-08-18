import {
  type InsertNodesOptions,
  type SlateEditor,
  type TElement,
  isExpanded,
  isSelectionAtBlockStart,
  setElements,
  someNode,
  wrapNodes,
} from '@udecode/plate-common';

import { CodeBlockPlugin, CodeLinePlugin } from '../CodeBlockPlugin';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = <E extends SlateEditor>(
  editor: E,
  insertNodesOptions: Omit<InsertNodesOptions<E>, 'match'> = {}
) => {
  if (!editor.selection || isExpanded(editor.selection)) return;

  const matchCodeElements = (node: TElement) =>
    node.type === editor.getType(CodeBlockPlugin) ||
    node.type === editor.getType(CodeLinePlugin);

  if (
    someNode(editor, {
      match: matchCodeElements,
    })
  ) {
    return;
  }
  if (!isSelectionAtBlockStart(editor)) {
    editor.insertBreak();
  }

  setElements(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(CodeLinePlugin),
    },
    insertNodesOptions
  );

  wrapNodes<TElement>(
    editor,
    {
      children: [],
      type: editor.getType(CodeBlockPlugin),
    },
    insertNodesOptions
  );
};
