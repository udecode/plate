import { AutoformatRule } from '../../types';

export const autoformatDivision: AutoformatRule[] = [
  {
    mode: 'text',
    match: '//',
    format: '÷',
  },
];

export const autoformatOperation: AutoformatRule[] = [
  {
    mode: 'text',
    match: '+-',
    format: '±',
  },
  {
    mode: 'text',
    match: '%%',
    format: '‰',
  },
  {
    mode: 'text',
    match: ['%%%', '‰%'],
    format: '‱',
  },
  ...autoformatDivision,
];
