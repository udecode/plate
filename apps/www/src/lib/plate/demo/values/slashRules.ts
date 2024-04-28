import { TComboboxItem } from '@udecode/plate-combobox';
import { PlateEditor, toggleNodeType } from '@udecode/plate-core';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import { focusEditor } from '@udecode/slate-react';

export const SLASH_ENABLED: TComboboxItem[] = [
  { key: '0', text: 'Heading 1' },
  { key: '1', text: 'Heading 2' },
  { key: '2', text: 'Heading 3' },
  {
    key: '3',
    text: 'Bulleted list',
  },
  {
    key: '4',
    text: 'Numbered list',
  },
];

export const SLASH_TRIGGER = [
  {
    matchText: 'Heading 1',
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H1 });
      focusEditor(editor);
    },
  },
  {
    matchText: 'Heading 2',
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H2 });
      focusEditor(editor);
    },
  },
  {
    matchText: 'Heading 3',
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H3 });
      focusEditor(editor);
    },
  },
  {
    matchText: 'Bulleted list',
    onTrigger(editor: PlateEditor) {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
      focusEditor(editor);
    },
  },
  {
    matchText: 'Numbered list',
    onTrigger(editor: PlateEditor) {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
      focusEditor(editor);
    },
  },
];
