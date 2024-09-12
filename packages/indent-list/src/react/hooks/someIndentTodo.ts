import { type SlateEditor, someNode } from '@udecode/plate-common';

import { BaseIndentListPlugin, INDENT_LIST_KEYS } from '../../index';

export const someIndentTodo = (editor: SlateEditor) => {
  return someNode(editor, {
    at: editor.selection!,
    match: (n) => {
      const list = n[BaseIndentListPlugin.key];
      const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

      return n.type === 'p' && isHasProperty && list === INDENT_LIST_KEYS.todo;
    },
  });
};
