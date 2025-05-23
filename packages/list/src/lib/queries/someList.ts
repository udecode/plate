import type { SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const someList = (editor: SlateEditor, type: string[] | string) => {
  return (
    !!editor.selection &&
    editor.api.some({
      match: (n: any) => {
        const isHasProperty = n.hasOwnProperty(KEYS.listChecked);

        if (isHasProperty) {
          return false;
        }

        const list = n[KEYS.listType];

        return Array.isArray(type) ? type.includes(list) : list === type;
      },
    })
  );
};
