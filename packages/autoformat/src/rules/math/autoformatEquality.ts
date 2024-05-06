import type { AutoformatRule } from '../../types';

export const autoformatEquality: AutoformatRule[] = [
  {
    format: '≠',
    match: '!=',
    mode: 'text',
  },
  {
    format: '≡',
    match: '==',
    mode: 'text',
  },
  {
    format: '≢',
    match: ['!==', '≠='],
    mode: 'text',
  },
  {
    format: '≈',
    match: '~=',
    mode: 'text',
  },
  {
    format: '≉',
    match: '!~=',
    mode: 'text',
  },
];
