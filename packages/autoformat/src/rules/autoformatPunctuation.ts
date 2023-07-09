import { AutoformatRule } from '../types';

export const autoformatPunctuation: AutoformatRule[] = [
  {
    mode: 'text',
    match: '--',
    format: '\u2014',
  },
  {
    mode: 'text',
    match: '...',
    format: '…',
  },
  {
    mode: 'text',
    match: '>>',
    format: '»',
  },
  {
    mode: 'text',
    match: '<<',
    format: '«',
  },
];
