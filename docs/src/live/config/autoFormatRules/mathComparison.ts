import { AutoformatRule, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { formatText } from './utils';

export const mathComparison: AutoformatRule[] = [
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '!',
    trigger: '>',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≯'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '!',
    trigger: '<',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≮'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '>',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≥'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '<',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≤'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '!>',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≱'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '!<',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≰'),
  },
];
