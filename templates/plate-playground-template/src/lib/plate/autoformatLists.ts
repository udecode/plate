import { AutoformatRule } from '@udecode/plate-autoformat';
import { isBlock, setNodes } from '@udecode/plate-common';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_TODO_LI, ELEMENT_UL, TTodoListItemElement } from '@udecode/plate-list';



import { formatList, preFormat } from '@/lib/plate/autoformatUtils';





export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['^\\d+\\.$ ', '^\\d+\\)$ '],
    matchByRegex: true,
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: '[] ',
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: '[x] ',
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
  },
];