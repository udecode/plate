import type { AutoformatRule } from '../types';

export const autoformatPunctuation: AutoformatRule[] = [
  {
    format: '\u2014',
    match: '--',
    mode: 'text',
  },
  {
    format: '…',
    match: '...',
    mode: 'text',
  },
  {
    format: '»',
    match: '>>',
    mode: 'text',
  },
  {
    format: '«',
    match: '<<',
    mode: 'text',
  },
];
