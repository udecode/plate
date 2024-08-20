import type { AutoformatRule } from '../types';

export const autoformatSmartQuotes: AutoformatRule[] = [
  {
    format: ['“', '”'],
    match: '"',
    mode: 'text',
  },
  {
    format: ['‘', '’'],
    match: "'",
    mode: 'text',
  },
];
