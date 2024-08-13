import type { AutoformatRule } from '@udecode/plate-autoformat';

import { isBlock, setNodes } from '@udecode/plate-common';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  type TTodoListItemElement,
} from '@udecode/plate-list';

import { formatList, preFormat } from './autoformatUtils';

export const autoformatLists: AutoformatRule[] = [
  {
    format: (editor) => formatList(editor, ELEMENT_UL),
    match: ['* ', '- '],
    mode: 'block',
    preFormat,
    type: ELEMENT_LI,
  },
  {
    format: (editor) => formatList(editor, ELEMENT_OL),
    match: ['^\\d+\\.$ ', '^\\d+\\)$ '],
    matchByRegex: true,
    mode: 'block',
    preFormat,
    type: ELEMENT_LI,
  },
  {
    match: '[] ',
    mode: 'block',
    type: ELEMENT_TODO_LI,
  },
  {
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { checked: true, type: ELEMENT_TODO_LI },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
    match: '[x] ',
    mode: 'block',
    type: ELEMENT_TODO_LI,
  },
];
