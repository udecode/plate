import { PlateEditor, toggleNodeType } from '@udecode/plate-core';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import { SlashRule } from '@udecode/plate-slash-command';
import { focusEditor } from '@udecode/slate-react';

export const SLASH_RULES: SlashRule[] = [
  {
    key: ELEMENT_H1,
    text: 'Heading 1',
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H1 });
      focusEditor(editor);
    },
  },
  {
    key: ELEMENT_H2,
    text: 'Heading 2',
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H2 });
      focusEditor(editor);
    },
  },
  {
    key: ELEMENT_H3,
    text: 'Heading 3',
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H3 });
      focusEditor(editor);
    },
  },
  {
    key: ListStyleType.Disc,
    text: 'Bulleted list',
    onTrigger(editor: PlateEditor) {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
      focusEditor(editor);
    },
  },
  {
    key: ListStyleType.Decimal,
    text: 'Numbered list',
    onTrigger(editor: PlateEditor) {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
      focusEditor(editor);
    },
  },
];
