import { type SlateEditor, someNode } from '@udecode/plate-common';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
  ListStyleType,
} from '../../index';

export const someIndentList = (editor: SlateEditor, type: string) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => {
        const list = n[BaseIndentListPlugin.key];

        if ((type as any) === ListStyleType.Disc) {
          return list === ListStyleType.Disc;
        }

        const isHasProperty = n.hasOwnProperty(INDENT_LIST_KEYS.checked);

        return !!list && list !== ListStyleType.Disc && !isHasProperty;
      },
    })
  );
};
