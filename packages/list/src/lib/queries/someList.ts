import type { BaseEditor } from '@platejs/core';

import { KEYS } from 'platejs';

export const someList = (editor: BaseEditor, type: string[] | string) =>
  !!editor.read.selection() &&
  editor.read.nodes.some({
    match: (n: any) => {
      const isHasProperty = Object.hasOwn(n, KEYS.listChecked);

      if (isHasProperty) {
        return false;
      }

      const list = n[KEYS.listType];

      return Array.isArray(type) ? type.includes(list) : list === type;
    },
  });
