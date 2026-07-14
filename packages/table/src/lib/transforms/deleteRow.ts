import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import type { TTableElement } from '@platejs/utils';

import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { TableConfig } from '..';

import { deleteRowWhenExpanded } from '../merge';
import { deleteTableMergeRow } from '../merge/deleteRow';

export const deleteRow = (editor: BaseEditor, tx: EditorUpdateTransaction) => {
  const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
    key: KEYS.table,
  });
  const { disableMerge } = getOptions();

  if (!disableMerge) {
    return deleteTableMergeRow(editor, tx);
  }
  if (
    editor.read.nodes.some({
      match: { type },
    })
  ) {
    const currentTableItem = editor.read.nodes.above<TTableElement>({
      match: { type },
    });

    if (!currentTableItem) return;
    if (editor.read.selection.isExpanded())
      return deleteRowWhenExpanded(editor, tx, currentTableItem);

    const currentRowItem = editor.read.nodes.above({
      match: { type: editor.getType(KEYS.tr) },
    });

    if (
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last row
      currentTableItem[0].children.length > 1
    ) {
      tx.nodes.remove({ at: currentRowItem[1] });
    }
  }
};
