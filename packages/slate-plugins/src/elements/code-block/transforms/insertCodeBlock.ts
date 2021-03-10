import {
  InsertNodesOptions,
  isExpanded,
  isSelectionAtBlockStart,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Node, Transforms } from 'slate';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = (
  editor: Editor,
  insertNodesOptions: Omit<InsertNodesOptions, 'match'> = {},
  options: SlatePluginsOptions
) => {
  const { code_line, code_block } = options;

  if (!editor.selection || isExpanded(editor.selection)) return;

  const matchCodeElements = (node: Node) =>
    node.type === code_block.type || node.type === code_line.type;

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

  Transforms.setNodes(
    editor,
    {
      type: code_line.type,
      children: [{ text: '' }],
    },
    insertNodesOptions
  );

  wrapNodes(
    editor,
    {
      type: code_block.type,
      children: [],
    },
    insertNodesOptions
  );
};
