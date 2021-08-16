import { AutoformatRule } from '../types';

export const autoformatArrow: AutoformatRule[] = [
  {
    mode: 'text',
    match: '->',
    handler: '→',
  },
  {
    mode: 'text',
    match: '<-',
    handler: '←',
  },
  {
    mode: 'text',
    match: '=>',
    handler: '⇒',
  },
  {
    mode: 'text',
    match: ['<=', '≤='],
    handler: '⇐',
  },
];
