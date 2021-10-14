import {
  InsertNodesOptions,
  isExpanded,
  isSelectionAtBlockStart,
  setNodes,
  someNode,
  wrapNodes,
} from '@udecode/plate-common';
import { SPEditor, TElement } from '@udecode/plate-core';
import { getCodeBlockType, getCodeLineType } from '../options';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = (
  editor: SPEditor,
  insertNodesOptions: Omit<InsertNodesOptions, 'match'> = {}
) => {
  if (!editor.selection || isExpanded(editor.selection)) return;

  const matchCodeElements = (node: TElement) =>
    node.type === getCodeBlockType(editor) ||
    node.type === getCodeLineType(editor);

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

  setNodes<TElement>(
    editor,
    {
      type: getCodeLineType(editor),
      children: [{ text: '' }],
    },
    insertNodesOptions
  );

  wrapNodes(
    editor,
    {
      type: getCodeBlockType(editor),
      children: [],
    },
    insertNodesOptions
  );
};
