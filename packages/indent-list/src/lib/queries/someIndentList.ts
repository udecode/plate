import type { SlateEditor } from '@udecode/plate';

import { BaseIndentListPlugin, INDENT_LIST_KEYS } from '../../index';

export const someIndentList = (
  editor: SlateEditor,
  type: string[] | string
) => {
  return (
    !!editor.selection &&
    editor.api.some({
      match: (n: any) => {
        const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

        if (isHasProperty) {
          return false;
        }

        const list = n[BaseIndentListPlugin.key];

        return Array.isArray(type) ? type.includes(list) : list === type;
      },
    })
  );
};
