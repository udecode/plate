import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';

export const deleteTable = (editor: Editor, options: SlatePluginsOptions) => {
  const { table } = options;

  if (someNode(editor, { match: { type: table.type } })) {
    const tableItem = getAbove(editor, { match: { type: table.type } });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
