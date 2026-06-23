import type { EditorUpdateTransaction } from '@platejs/slate';

import { type SlateEditor, KEYS, PathApi } from 'platejs';

import { insertCodeBlock } from './insertCodeBlock';

type InsertNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
>;

export type CodeBlockInsertOptions = {
  defaultType?: string;
  insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
};

/**
 * Called by toolbars to make sure a code-block gets inserted below a paragraph
 * rather than awkwardly splitting the current selection.
 */
export const insertEmptyCodeBlock = (
  editor: SlateEditor,
  {
    defaultType = editor.getType(KEYS.p),
    insertNodesOptions,
  }: CodeBlockInsertOptions = {}
) => {
  if (!editor.selection) return;
  if (
    editor.api.isExpanded() ||
    !editor.api.isEmpty(editor.selection, { block: true })
  ) {
    const insertAt = insertNodesOptions?.at ?? editor.selection;
    const endPoint = editor.api.end(insertAt);
    const blockEntry = editor.api.block({ at: endPoint });
    const nextPath = blockEntry ? PathApi.next(blockEntry[1]) : undefined;

    editor.update((tx) => {
      tx.nodes.insert(
        editor.api.create.block({
          children: [{ text: '' }],
          type: defaultType,
        }),
        {
          at: nextPath,
          select: true,
          ...insertNodesOptions,
        }
      );
    });
  }

  insertCodeBlock(editor, insertNodesOptions);
};
