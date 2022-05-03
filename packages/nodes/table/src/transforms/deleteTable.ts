import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ELEMENT_TABLE } from '../createTablePlugin';

export const deleteTable = <V extends Value>(editor: PlateEditor<V>) => {
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
