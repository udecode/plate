import { AutoformatRule, ELEMENT_DEFAULT } from '@udecode/plate';
import { formatText } from '../autoformatUtils';

export const autoformatPunctuation: AutoformatRule[] = [
  {
    mode: 'text',
    markup: '--',
    format: (editor) => formatText(editor, '\u2014'),
  },
  {
    markup: '...',
    format: (editor) => formatText(editor, '…'),
  },
  {
    markup: '>>',
    format: (editor) => formatText(editor, '»'),
  },
  {
    markup: '<<',
    format: (editor) => formatText(editor, '«'),
  },
];
