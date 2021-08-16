import { AutoformatRule } from '@udecode/plate';

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
