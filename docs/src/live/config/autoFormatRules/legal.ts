import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from './_utils';

export const legal: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['(tm', '(TM'],
    trigger: ')',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '™'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['(r', '(R'],
    trigger: ')',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '®'),
  },

  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['(c', '(C'],
    trigger: ')',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '©'),
  },
];

export const legalHtml: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&trade;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '™'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&reg;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '®'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&copy;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '©'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&sect;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '§'),
  },
];
