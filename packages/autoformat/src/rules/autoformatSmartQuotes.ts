import { AutoformatRule } from '../types';

export const autoformatSmartQuotes: AutoformatRule[] = [
  {
    mode: 'text',
    match: '"',
    format: ['“', '”'],
  },
  {
    mode: 'text',
    match: "'",
    format: ['‘', '’'],
  },
];
