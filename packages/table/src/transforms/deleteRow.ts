import {
  getAboveNode,
  getPluginOptions,
  getPluginType,
  PlateEditor,
  removeNodes,
  someNode,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { deleteRow as deleteRowMerging } from '../merge/deleteRow';
import { TablePlugin, TTableElement } from '../types';

export const deleteRow = <V extends Value>(editor: PlateEditor<V>) => {
  const { disableCellsMerging } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );
  if (!disableCellsMerging) {
    return deleteRowMerging(editor);
  }

  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentTableItem = getAboveNode<TTableElement>(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });
    const currentRowItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
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
