import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from './_utils';

export const punctuation: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '-',
    trigger: '-',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '\u2014'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '..',
    trigger: '.',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '…'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '>',
    trigger: '>',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '»'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '<',
    trigger: '<',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '«'),
  },
];
