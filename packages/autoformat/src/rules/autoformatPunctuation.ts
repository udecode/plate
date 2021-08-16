import { AutoformatRule } from '../types';

export const autoformatPunctuation: AutoformatRule[] = [
  {
    mode: 'text',
    match: '--',
    handler: '\u2014',
  },
  {
    mode: 'text',
    match: '...',
    handler: '…',
  },
  {
    mode: 'text',
    match: '>>',
    handler: '»',
  },
  {
    mode: 'text',
    match: '<<',
    handler: '«',
  },
];
