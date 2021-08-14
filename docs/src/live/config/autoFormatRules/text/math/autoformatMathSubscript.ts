import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from '../../autoformatUtils';

export const autoformatMathSubscriptNumbers: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '0',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₀'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '1',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₁'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '2',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₂'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '3',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₃'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '4',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₄'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '5',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₅'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '6',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₆'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '7',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₇'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '8',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₈'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '9',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₉'),
  },
];

export const autoformatMathSubscriptSymbols: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '+',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₊'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '~',
    trigger: '-',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '₋'),
  },
];
