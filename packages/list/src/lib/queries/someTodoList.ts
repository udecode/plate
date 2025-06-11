import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

export const someTodoList = (editor: SlateEditor) => {
  return editor.api.some({
    at: editor.selection!,
    match: (n) => {
      const list = n[KEYS.listType];
      const isHasProperty = n.hasOwnProperty(KEYS.listChecked);

      return n.type === 'p' && isHasProperty && list === KEYS.listTodo;
    },
  });
};
