import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { insertCodeBlock } from './insertCodeBlock';

export type CodeBlockInsertOptions = {
  defaultType?: string;
  insertNodesOptions?: Omit<NodeInsertNodesOptions<Element>, 'match'>;
};

/**
 * Called by toolbars to make sure a code-block gets inserted below a paragraph
 * rather than awkwardly splitting the current selection.
 */
export const insertEmptyCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    defaultType = editor.getType(KEYS.p),
    insertNodesOptions,
  }: CodeBlockInsertOptions = {}
) => {
  const selection = tx.selection();

  if (!selection) return;
  const block = tx.selection.isCollapsed()
    ? tx.nodes.block({ at: selection })
    : undefined;
  const shouldInsertNextBlock =
    tx.selection.isExpanded() || !block || !tx.nodes.isEmpty(block[0]);
  let codeBlockOptions = insertNodesOptions;

  if (shouldInsertNextBlock) {
    const { at: _at, ...options } = insertNodesOptions ?? {};

    tx.blocks.insertAfter(
      { children: [{ text: '' }], type: defaultType },
      {
        ...insertNodesOptions,
        select: true,
      }
    );
    codeBlockOptions = options;
  }

  insertCodeBlock(editor, tx, codeBlockOptions);
};
