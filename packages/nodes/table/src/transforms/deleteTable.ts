import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  someNode,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ELEMENT_TABLE } from '../createTablePlugin';

export const deleteTable = (editor: PlateEditor) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const tableItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
