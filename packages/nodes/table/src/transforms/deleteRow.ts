import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';

export const deleteRow = <V extends Value>(editor: PlateEditor<V>) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentTableItem = getAboveNode(editor, {
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
      Transforms.removeNodes(editor, {
        at: currentRowItem[1],
      });
    }
  }
};
