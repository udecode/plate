import { toggleIndentList } from '@udecode/plate';
import { PlateEditor } from '@udecode/plate-common';
import { ELEMENT_UL, toggleList } from '@udecode/plate-list';

export const toggleListDemo = (editor: PlateEditor, type: string) => {
  if (editor.pluginsByKey[ELEMENT_UL]) {
    toggleList(editor, { type });
  } else {
    toggleIndentList(editor, {
      listStyleType: type === ELEMENT_UL ? 'disc' : 'decimal',
    });
  }
};
