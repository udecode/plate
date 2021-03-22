import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_TABLE } from '../defaults';

export const deleteTable = (editor: Editor) => {
  if (
    someNode(editor, { match: { type: getPluginType(editor, ELEMENT_TABLE) } })
  ) {
    const tableItem = getAbove(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
