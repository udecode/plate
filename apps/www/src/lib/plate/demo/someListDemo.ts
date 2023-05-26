import { KEY_LIST_STYLE_TYPE } from '@udecode/plate';
import { someNode } from '@udecode/plate-common';
import { ELEMENT_UL, getListItemEntry } from '@udecode/plate-list';

export const someListDemo = (editor, type: string) => {
  if (editor.pluginsByKey[ELEMENT_UL]) {
    return !!getListItemEntry(editor);
  }
  return someNode(editor, {
    match: (n) => {
      const list = n[KEY_LIST_STYLE_TYPE];
      if (type === ELEMENT_UL) return list === 'disc';
      return !!list && list !== 'disc';
    },
  });
};
