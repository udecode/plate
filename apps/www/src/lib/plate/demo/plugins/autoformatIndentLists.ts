import type { AutoformatRule } from '@udecode/plate-autoformat';

import {
  KEY_TODO_STYLE_TYPE,
  ListStyleType,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { setNodes } from '@udecode/slate';

export const autoformatIndentLists: AutoformatRule[] = [
  {
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
    match: ['* ', '- '],
    mode: 'block',
    type: 'list',
  },
  {
    format: (editor) =>
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      }),
    match: ['1. ', '1) '],
    mode: 'block',
    type: 'list',
  },
  {
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
      setNodes(editor, {
        checked: false,
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
    },
    match: ['[] '],
    mode: 'block',
    type: 'list',
  },
  {
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
      setNodes(editor, {
        checked: true,
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
    },
    match: ['[x] '],
    mode: 'block',
    type: 'list',
  },
];
