import {
  type PlateEditor,
  getAboveNode,
  getPluginOptions,
  getPluginType,
  isExpanded,
  removeNodes,
  someNode,
} from '@udecode/plate-common';

import type { TTableElement, TablePluginOptions } from '../types';

import { TablePlugin, TableRowPlugin } from '../TablePlugin';
import { deleteTableMergeRow } from '../merge/deleteRow';
import { deleteRowWhenExpanded } from '../merge/deleteRowWhenExpanded';

export const deleteRow = (editor: PlateEditor) => {
  const { enableMerging } = getPluginOptions<TablePluginOptions>(
    editor,
    TablePlugin.key
  );

  if (enableMerging) {
    return deleteTableMergeRow(editor);
  }
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, TablePlugin.key) },
    })
  ) {
    const currentTableItem = getAboveNode<TTableElement>(editor, {
      match: { type: getPluginType(editor, TablePlugin.key) },
    });

    if (!currentTableItem) return;
    if (isExpanded(editor.selection))
      return deleteRowWhenExpanded(editor, currentTableItem);

    const currentRowItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, TableRowPlugin.key) },
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
