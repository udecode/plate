import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from '../autoformatUtils';

export const autoformatArrow: AutoformatRule[] = [
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '-',
    trigger: '>',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '→'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '<',
    trigger: '-',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '←'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: '=',
    trigger: '>',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⇒'),
  },
  {
    type: ELEMENT_DEFAULT,
    mode: 'block',
    markup: ['<', '≤'],
    trigger: '=',
    triggerAtBlockStart: false,
    format: (editor) => formatText(editor, '⇐'),
  },
];
