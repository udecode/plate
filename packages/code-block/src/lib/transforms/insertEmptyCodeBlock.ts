import {
  type InsertNodesOptions,
  type SlateEditor,
  BaseParagraphPlugin,
} from '@udecode/plate';

import { insertCodeBlock } from './insertCodeBlock';

export interface CodeBlockInsertOptions {
  defaultType?: string;
  insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
}

/**
 * Called by toolbars to make sure a code-block gets inserted below a paragraph
 * rather than awkwardly splitting the current selection.
 */
export const insertEmptyCodeBlock = (
  editor: SlateEditor,
  {
    defaultType = editor.getType(BaseParagraphPlugin),
    insertNodesOptions,
  }: CodeBlockInsertOptions = {}
) => {
  if (!editor.selection) return;
  if (
    editor.api.isExpanded() ||
    !editor.api.isEmpty(editor.selection, { block: true })
  ) {
    editor.tf.insertNodes(
      editor.api.create.block({ children: [{ text: '' }], type: defaultType }),
      {
        nextBlock: true,
        select: true,
        ...insertNodesOptions,
      }
    );
  }

  insertCodeBlock(editor, insertNodesOptions);
};
