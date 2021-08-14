import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from '../autoformatUtils';

export const autoformatLegal: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['(tm', '(TM'],
    trigger: ')',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '™'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['(r', '(R'],
    trigger: ')',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '®'),
  },

  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['(c', '(C'],
    trigger: ')',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '©'),
  },
];

export const autoformatLegalHtml: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&trade;',
    trigger: ' ',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '™'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&reg;',
    trigger: ' ',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '®'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&copy;',
    trigger: ' ',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '©'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '&sect;',
    trigger: ' ',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '§'),
  },
];
