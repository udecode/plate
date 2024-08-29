import {
  type SlateEditor,
  getAboveNode,
  getEditorPlugin,
  isExpanded,
  removeNodes,
  someNode,
} from '@udecode/plate-common';

import { type TTableElement, TableRowPlugin } from '../../lib';
import { TablePlugin } from '../TablePlugin';
import { deleteRowWhenExpanded } from '../merge';
import { deleteTableMergeRow } from '../merge/deleteRow';

export const deleteRow = (editor: SlateEditor) => {
  const { getOptions, type } = getEditorPlugin(editor, TablePlugin);
  const { enableMerging } = getOptions();

  if (enableMerging) {
    return deleteTableMergeRow(editor);
  }
  if (
    someNode(editor, {
      match: { type },
    })
  ) {
    const currentTableItem = getAboveNode<TTableElement>(editor, {
      match: { type },
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
