import type { SlashRule } from '@udecode/plate-slash-command';

import { type PlateEditor, toggleNodeType } from '@udecode/plate-core';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import { focusEditor } from '@udecode/slate-react';

export const SLASH_RULES: SlashRule[] = [
  {
    key: ELEMENT_H1,
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H1 });
      focusEditor(editor);
    },
    text: 'Heading 1',
  },
  {
    key: ELEMENT_H2,
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H2 });
      focusEditor(editor);
    },
    text: 'Heading 2',
  },
  {
    key: ELEMENT_H3,
    onTrigger(editor: PlateEditor) {
      toggleNodeType(editor, { activeType: ELEMENT_H3 });
      focusEditor(editor);
    },
    text: 'Heading 3',
  },
  {
    key: ListStyleType.Disc,
    onTrigger(editor: PlateEditor) {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
      focusEditor(editor);
    },
    text: 'Bulleted list',
  },
  {
    key: ListStyleType.Decimal,
    onTrigger(editor: PlateEditor) {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
      focusEditor(editor);
    },
    text: 'Numbered list',
  },
];
