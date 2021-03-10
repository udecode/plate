import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';

export const deleteRow = (editor: Editor, options: SlatePluginsOptions) => {
  const { table, tr } = options;

  if (someNode(editor, { match: { type: table.type } })) {
    const currentTableItem = getAbove(editor, { match: { type: table.type } });
    const currentRowItem = getAbove(editor, { match: { type: tr.type } });
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
