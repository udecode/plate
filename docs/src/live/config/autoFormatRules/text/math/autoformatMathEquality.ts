import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from '../../autoformatUtils';

export const autoformatMathEquality: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '!',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≠'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '=',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≡'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['!=', '≠'],
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≢'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≈'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '!~',
    trigger: '=',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '≉'),
  },
];
