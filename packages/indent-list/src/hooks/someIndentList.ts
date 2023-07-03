import { PlateEditor, Value, someNode } from '@udecode/plate-common';

import { KEY_LIST_STYLE_TYPE, ListStyleType } from '../index';

export const someIndentList = <V extends Value>(
  editor: PlateEditor<V>,
  type: string
) => {
  return someNode(editor, {
    match: (n) => {
      const list = n[KEY_LIST_STYLE_TYPE];
      if (type === ListStyleType.Disc) return list === ListStyleType.Disc;
      return !!list && list !== ListStyleType.Disc;
    },
  });
};
