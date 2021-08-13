import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { DIGITS, DIGITS_WITH_SPACE } from '../../autoformatConstants';
import { formatText } from '../../autoformatUtils';

export const autoformatMathOperation: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '+',
    trigger: '-',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '±'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '%',
    trigger: '%',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '‰'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['%%', '‰'],
    trigger: '%',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '‱'),
  },
];

const multiplicationWithoutSpace: AutoformatRule[] = DIGITS.map((digit) => ({
  type: ELEMENT_DEFAULT,
  mode: 'block',
  markup: [`${digit}*`, `${digit}x`],
  trigger: [...DIGITS, ...DIGITS_WITH_SPACE],
  insertTrigger: true,
  triggerAtBlockStart: false,
  format: (editor) => formatText(editor, `${digit}×`),
}));

const multiplicationWithSpace: AutoformatRule[] = DIGITS.map((digit) => ({
  type: ELEMENT_DEFAULT,
  mode: 'block',
  markup: [`${digit} *`, `${digit} x`],
  trigger: [...DIGITS, ...DIGITS_WITH_SPACE],
  insertTrigger: true,
  triggerAtBlockStart: false,
  format: (editor) => formatText(editor, `${digit} ×`),
}));

export const autoformatMathMultiplication: AutoformatRule[] = [
  ...multiplicationWithoutSpace,
  ...multiplicationWithSpace,
];

export const autoformatMathDivision: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '/',
    trigger: '/',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '÷'),
  },
];
