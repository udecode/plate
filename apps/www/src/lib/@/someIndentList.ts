import { KEY_LIST_STYLE_TYPE, ListStyleType } from '@udecode/plate';
import { someNode } from '@udecode/plate-common';

export const someIndentList = (editor, type: string) => {
  return someNode(editor, {
    match: (n) => {
      const list = n[KEY_LIST_STYLE_TYPE];
      if (type === ListStyleType.Disc) return list === ListStyleType.Disc;
      return !!list && list !== ListStyleType.Disc;
    },
  });
};
