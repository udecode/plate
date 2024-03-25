import { AutoformatRule } from '@udecode/plate-autoformat';
import {
  KEY_TODO_STYLE_TYPE,
  ListStyleType,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { setNodes } from '@udecode/slate';

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
  {
    mode: 'block',
    type: 'list',
    match: ['[] '],
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
      setNodes(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
        checked: false,
      });
    },
  },
  {
    mode: 'block',
    type: 'list',
    match: ['[x] '],
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
      setNodes(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
        checked: true,
      });
    },
  },
];
