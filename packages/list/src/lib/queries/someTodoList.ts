import type { BaseEditor } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const someTodoList = (editor: BaseEditor) =>
  editor.read.nodes.some({
    at: editor.read.selection() ?? undefined,
    match: (n) => {
      if (!ElementApi.isElement(n)) return false;

      const list = n[KEYS.listType];
      const isHasProperty = Object.hasOwn(n, KEYS.listChecked);

      return n.type === 'p' && isHasProperty && list === KEYS.listTodo;
    },
  });
