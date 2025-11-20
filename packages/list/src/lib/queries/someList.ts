import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

export const someList = (editor: SlateEditor, type: string[] | string) =>
  !!editor.selection &&
  editor.api.some({
    match: (n: any) => {
      const isHasProperty = Object.hasOwn(n, KEYS.listChecked);

      if (isHasProperty) {
        return false;
      }

      const list = n[KEYS.listType];

      return Array.isArray(type) ? type.includes(list) : list === type;
    },
  });
