import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

export const someTodoList = (editor: SlateEditor) =>
  editor.api.some({
    at: editor.selection!,
    match: (n) => {
      const list = n[KEYS.listType];
      const isHasProperty = Object.hasOwn(n, KEYS.listChecked);

      return n.type === 'p' && isHasProperty && list === KEYS.listTodo;
    },
  });
