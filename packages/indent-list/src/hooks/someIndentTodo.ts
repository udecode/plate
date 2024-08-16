import { type PlateEditor, someNode } from '@udecode/plate-common';

import { INDENT_LIST_KEYS, IndentListPlugin } from '../index';

export const someIndentTodo = (editor: PlateEditor) => {
  return someNode(editor, {
    at: editor.selection!,
    match: (n) => {
      const list = n[IndentListPlugin.key];
      const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

      return n.type === 'p' && isHasProperty && list === INDENT_LIST_KEYS.todo;
    },
  });
};
