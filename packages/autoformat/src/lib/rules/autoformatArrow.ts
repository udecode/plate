import type { AutoformatRule } from '../types';

export const autoformatArrow: AutoformatRule[] = [
  {
    format: '→',
    match: '->',
    mode: 'text',
  },
  {
    format: '←',
    match: '<-',
    mode: 'text',
  },
  {
    format: '⇒',
    match: '=>',
    mode: 'text',
  },
  {
    format: '⇐',
    match: ['<=', '≤='],
    mode: 'text',
  },
];
