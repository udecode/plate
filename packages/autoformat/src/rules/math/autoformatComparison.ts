import { AutoformatRule } from '../../../common/types';

export const autoformatComparison: AutoformatRule[] = [
  {
    mode: 'text',
    match: '!>',
    format: '≯',
  },
  {
    mode: 'text',
    match: '!<',
    format: '≮',
  },
  {
    mode: 'text',
    match: '>=',
    format: '≥',
  },
  {
    mode: 'text',
    match: '<=',
    format: '≤',
  },
  {
    mode: 'text',
    match: '!>=',
    format: '≱',
  },
  {
    mode: 'text',
    match: '!<=',
    format: '≰',
  },
];
