import { AutoformatRule } from '../../../common/types';

export const autoformatEquality: AutoformatRule[] = [
  {
    mode: 'text',
    match: '!=',
    format: '≠',
  },
  {
    mode: 'text',
    match: '==',
    format: '≡',
  },
  {
    mode: 'text',
    match: ['!==', '≠='],
    format: '≢',
  },
  {
    mode: 'text',
    match: '~=',
    format: '≈',
  },
  {
    mode: 'text',
    match: '!~=',
    format: '≉',
  },
];
