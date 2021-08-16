import { AutoformatRule } from '../../types';

export const autoformatEquality: AutoformatRule[] = [
  {
    mode: 'text',
    match: '!=',
    handler: '≠',
  },
  {
    mode: 'text',
    match: '==',
    handler: '≡',
  },
  {
    mode: 'text',
    match: ['!==', '≠='],
    handler: '≢',
  },
  {
    mode: 'text',
    match: '~=',
    handler: '≈',
  },
  {
    mode: 'text',
    match: '!~=',
    handler: '≉',
  },
];
