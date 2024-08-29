import type { AutoformatRule } from '../../types';

export const autoformatComparison: AutoformatRule[] = [
  {
    format: '≯',
    match: '!>',
    mode: 'text',
  },
  {
    format: '≮',
    match: '!<',
    mode: 'text',
  },
  {
    format: '≥',
    match: '>=',
    mode: 'text',
  },
  {
    format: '≤',
    match: '<=',
    mode: 'text',
  },
  {
    format: '≱',
    match: '!>=',
    mode: 'text',
  },
  {
    format: '≰',
    match: '!<=',
    mode: 'text',
  },
];
