import {
  AutoformatRule,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/plate';
import { formatList, preFormat } from './_utils';

export const basicLists: AutoformatRule[] = [
  {
    type: ELEMENT_LI,
    markup: ['*', '-'],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    type: ELEMENT_LI,
    markup: ['1.', '1)'],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
  {
    type: ELEMENT_TODO_LI,
    markup: '[]',
  },
  // checked checkbox
  // {
  //  type: ELEMENT_TODO_LI,
  //  markup: '[x]',
  // },
];
