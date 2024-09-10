import {
  type SlateEditor,
  getAboveNode,
  removeNodes,
  someNode,
} from '@udecode/plate-common';

import { TablePlugin } from '../TablePlugin';

export const deleteTable = (editor: SlateEditor) => {
  if (
    someNode(editor, {
      match: { type: editor.getType(TablePlugin) },
    })
  ) {
    const tableItem = getAboveNode(editor, {
      match: { type: editor.getType(TablePlugin) },
    });

    if (tableItem) {
      removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
