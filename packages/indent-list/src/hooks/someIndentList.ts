import { type PlateEditor, someNode } from '@udecode/plate-common';

import { KEY_LIST_CHECKED, IndentListPlugin, ListStyleType } from '../index';

export const someIndentList = (editor: PlateEditor, type: string) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => {
        const list = n[IndentListPlugin.key];

        if ((type as any) === ListStyleType.Disc) {
          return list === ListStyleType.Disc;
        }

        const isHasProperty = n.hasOwnProperty(KEY_LIST_CHECKED);

        return !!list && list !== ListStyleType.Disc && !isHasProperty;
      },
    })
  );
};
