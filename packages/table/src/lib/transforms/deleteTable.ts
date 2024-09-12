import {
  type SlateEditor,
  getAboveNode,
  removeNodes,
  someNode,
} from '@udecode/plate-common';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const deleteTable = (editor: SlateEditor) => {
  if (
    someNode(editor, {
      match: { type: editor.getType(BaseTablePlugin) },
    })
  ) {
    const tableItem = getAboveNode(editor, {
      match: { type: editor.getType(BaseTablePlugin) },
    });

    if (tableItem) {
      removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
