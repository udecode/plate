import { AutoformatRule } from '../../types';

export const autoformatDivision: AutoformatRule[] = [
  {
    mode: 'text',
    match: '//',
    handler: '÷',
  },
];

export const autoformatOperation: AutoformatRule[] = [
  {
    mode: 'text',
    match: '+-',
    handler: '±',
  },
  {
    mode: 'text',
    match: ['%%', '%%%'],
    handler: '‰',
  },
  ...autoformatDivision,
];
