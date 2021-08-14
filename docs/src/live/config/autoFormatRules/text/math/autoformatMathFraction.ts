import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from '../../autoformatUtils';

export const autoformatMathFraction: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '2',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '½'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '3',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅓'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '4',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '¼'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '5',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅕'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '6',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅙'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '7',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅐'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '8',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅛'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/',
    trigger: '9',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅑'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '1/1',
    trigger: '0',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅒'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '2/',
    trigger: '3',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅔'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '2/',
    trigger: '5',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅖'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '3/',
    trigger: '4',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '¾'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '3/',
    trigger: '5',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅗'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '3/',
    trigger: '8',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅜'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '4/',
    trigger: '5',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅘'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '5/',
    trigger: '6',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅚'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '5/',
    trigger: '8',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅝'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '7/',
    trigger: '8',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⅞'),
  },
];
