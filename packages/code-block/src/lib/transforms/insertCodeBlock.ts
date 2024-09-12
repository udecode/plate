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

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

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
    node.type === editor.getType(BaseCodeBlockPlugin) ||
    node.type === editor.getType(BaseCodeLinePlugin);

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
      type: editor.getType(BaseCodeLinePlugin),
    },
    insertNodesOptions
  );

  wrapNodes<TElement>(
    editor,
    {
      children: [],
      type: editor.getType(BaseCodeBlockPlugin),
    },
    insertNodesOptions
  );
};
