import { AutoformatRule } from '../types';

export const autoformatArrow: AutoformatRule[] = [
  {
    mode: 'text',
    match: '->',
    format: '→',
  },
  {
    mode: 'text',
    match: '<-',
    format: '←',
  },
  {
    mode: 'text',
    match: '=>',
    format: '⇒',
  },
  {
    mode: 'text',
    match: ['<=', '≤='],
    format: '⇐',
  },
];
