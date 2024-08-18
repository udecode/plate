import {
  type SlateEditor,
  getAboveNode,
  isExpanded,
  removeNodes,
  someNode,
} from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { TablePlugin, TableRowPlugin } from '../TablePlugin';
import { deleteTableMergeRow } from '../merge/deleteRow';
import { deleteRowWhenExpanded } from '../merge/deleteRowWhenExpanded';

export const deleteRow = (editor: SlateEditor) => {
  const { enableMerging } = editor.getOptions(TablePlugin);

  if (enableMerging) {
    return deleteTableMergeRow(editor);
  }
  if (
    someNode(editor, {
      match: { type: editor.getType(TablePlugin) },
    })
  ) {
    const currentTableItem = getAboveNode<TTableElement>(editor, {
      match: { type: editor.getType(TablePlugin) },
    });

    if (!currentTableItem) return;
    if (isExpanded(editor.selection))
      return deleteRowWhenExpanded(editor, currentTableItem);

    const currentRowItem = getAboveNode(editor, {
      match: { type: editor.getType(TableRowPlugin) },
    });

    if (
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last row
      currentTableItem[0].children.length > 1
    ) {
      removeNodes(editor, {
        at: currentRowItem[1],
      });
    }
  }
};
