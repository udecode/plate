import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Element,
  type NodeInsertNodesOptions,
  PathApi,
  RangeApi,
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
  const selection = editor.read.selection();

  if (!selection) return;
  const block = editor.read.nodes.block({
    at: editor.read.selection.isExpanded()
      ? RangeApi.end(selection)
      : selection,
  });
  const shouldInsertNextBlock =
    editor.read.selection.isExpanded() ||
    !block ||
    !editor.read.nodes.isEmpty(block[0]);

  if (shouldInsertNextBlock) {
    tx.nodes.insert(
      { children: [{ text: '' }], type: defaultType },
      {
        at: block ? PathApi.next(block[1]) : [editor.read.children().length],
        select: true,
        ...insertNodesOptions,
      }
    );
  }

  insertCodeBlock(editor, tx, insertNodesOptions);
};
