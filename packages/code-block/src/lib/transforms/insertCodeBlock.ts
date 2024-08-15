import {
  type InsertNodesOptions,
  type PlateEditor,
  type TElement,
  getPluginType,
  isExpanded,
  isSelectionAtBlockStart,
  setElements,
  someNode,
  wrapNodes,
} from '@udecode/plate-common';

import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { getCodeLineType } from '../options';

/**
 * Insert a code block: set the node to code line and wrap it with a code block.
 * If the cursor is not at the block start, insert break before.
 */
export const insertCodeBlock = <E extends PlateEditor>(
  editor: E,
  insertNodesOptions: Omit<InsertNodesOptions<E>, 'match'> = {}
) => {
  if (!editor.selection || isExpanded(editor.selection)) return;

  const matchCodeElements = (node: TElement) =>
    node.type === editor.getType(CodeBlockPlugin) ||
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

  setElements(
    editor,
    {
      children: [{ text: '' }],
      type: getCodeLineType(editor),
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
