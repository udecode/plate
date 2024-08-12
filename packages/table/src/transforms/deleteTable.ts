import {
  type PlateEditor,
  getAboveNode,
  getPluginType,
  removeNodes,
  someNode,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../TablePlugin';

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
      removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
