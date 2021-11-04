import { getAbove, someNode } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TPlateEditor,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TR } from '../defaults';

export const deleteRow = (editor: SPEditor) => {
  if (
    someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentTableItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    });
    const currentRowItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TR) },
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
