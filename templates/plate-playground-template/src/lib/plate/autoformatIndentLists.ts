import { AutoformatRule } from '@udecode/plate-autoformat';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';

export const autoformatIndentLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: 'list',
    match: ['* ', '- '],
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    mode: 'block',
    type: 'list',
    match: ['1. ', '1) '],
    format: (editor) =>
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      }),
  },
];
