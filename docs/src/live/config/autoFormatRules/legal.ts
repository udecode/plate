import { AutoformatRule, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { formatText } from './utils';

export const legal: AutoformatRule[] = [
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: ['(tm', '(TM'],
    trigger: ')',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '™'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: ['(r', '(R'],
    trigger: ')',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '®'),
  },

  {
    type: ELEMENT_PARAGRAPH,
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
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '&trade;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '™'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '&reg;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '®'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '&copy;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '©'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '&sect;',
    trigger: ' ',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '§'),
  },
];
