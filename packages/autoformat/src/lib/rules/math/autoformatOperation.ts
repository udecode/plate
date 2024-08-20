import type { AutoformatRule } from '../../types';

export const autoformatDivision: AutoformatRule[] = [
  {
    format: '÷',
    match: '//',
    mode: 'text',
  },
];

export const autoformatOperation: AutoformatRule[] = [
  {
    format: '±',
    match: '+-',
    mode: 'text',
  },
  {
    format: '‰',
    match: '%%',
    mode: 'text',
  },
  {
    format: '‱',
    match: ['%%%', '‰%'],
    mode: 'text',
  },
  ...autoformatDivision,
];
