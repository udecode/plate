import type { SlateEditor } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../../index';

export const someList = (editor: SlateEditor, type: string[] | string) => {
  return (
    !!editor.selection &&
    editor.api.some({
      match: (n: any) => {
        const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

        if (isHasProperty) {
          return false;
        }

        const list = n[INDENT_LIST_KEYS.listStyleType];

        return Array.isArray(type) ? type.includes(list) : list === type;
      },
    })
  );
};
