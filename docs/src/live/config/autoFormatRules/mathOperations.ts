import { AutoformatRule, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { DIGITS, DIGITS_WITH_SPACE } from './constants';
import { formatText } from './utils';

export const mathOperations: AutoformatRule[] = [
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '+',
    trigger: '-',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '±'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: '%',
    trigger: '%',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '‰'),
  },
  {
    type: ELEMENT_PARAGRAPH,
    mode: 'block',
    markup: ['%%', '‰'],
    trigger: '%',
    insertTrigger: false,
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '‱'),
  },
];

const multiplicationWithoutSpace: AutoformatRule[] = DIGITS.map((digit) => ({
  type: ELEMENT_PARAGRAPH,
  mode: 'block',
  markup: [`${digit}*`, `${digit}x`],
  trigger: [...DIGITS_WITH_SPACE, ...DIGITS],
  insertTrigger: true,
  triggerAtBlockStart: false,
  format: (editor) => formatText(editor, `${digit}×`),
}));
const multiplicationWithSpace: AutoformatRule[] = DIGITS.map((digit) => ({
  type: ELEMENT_PARAGRAPH,
  mode: 'block',
  markup: [`${digit} *`, `${digit} x`],
  trigger: [...DIGITS_WITH_SPACE, ...DIGITS],
  insertTrigger: true,
  triggerAtBlockStart: false,
  format: (editor) => formatText(editor, `${digit} ×`),
}));
export const mathMultiplication: AutoformatRule[] = [...multiplicationWithSpace, ...multiplicationWithoutSpace];

const divisionWithoutSpace: AutoformatRule[] = DIGITS.map((digit) => ({
  type: ELEMENT_PARAGRAPH,
  mode: 'block',
  markup: `${digit}/`,
  trigger: [...DIGITS_WITH_SPACE, ...DIGITS],
  insertTrigger: true,
  triggerAtBlockStart: false,
  format: (editor) => formatText(editor, `${digit}÷`),
}));
const divisionWithSpace: AutoformatRule[] = DIGITS.map((digit) => ({
  type: ELEMENT_PARAGRAPH,
  mode: 'block',
  markup: `${digit} /`,
  trigger: [...DIGITS_WITH_SPACE, ...DIGITS],
  insertTrigger: true,
  triggerAtBlockStart: false,
  format: (editor) => formatText(editor, `${digit} ÷`),
}));
export const mathDivision: AutoformatRule[] = [...divisionWithSpace, ...divisionWithoutSpace];
