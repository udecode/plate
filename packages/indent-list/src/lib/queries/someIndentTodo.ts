import type { SlateEditor } from '@udecode/plate';

import { BaseIndentListPlugin, INDENT_LIST_KEYS } from '../../index';

export const someIndentTodo = (editor: SlateEditor) => {
  return editor.api.some({
    at: editor.selection!,
    match: (n) => {
      const list = n[BaseIndentListPlugin.key];
      const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

      return n.type === 'p' && isHasProperty && list === INDENT_LIST_KEYS.todo;
    },
  });
};
