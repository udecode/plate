import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  removeNodes,
  someNode,
  Value,
} from '@udecode/plate-common/server';

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
      removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
