import type { SlateEditor } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../../index';

export const someTodoList = (editor: SlateEditor) => {
  return editor.api.some({
    at: editor.selection!,
    match: (n) => {
      const list = n[INDENT_LIST_KEYS.listStyleType];
      const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

      return n.type === 'p' && isHasProperty && list === INDENT_LIST_KEYS.todo;
    },
  });
};
