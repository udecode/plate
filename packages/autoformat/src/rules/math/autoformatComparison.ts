import { AutoformatRule } from '../../types';

export const autoformatComparison: AutoformatRule[] = [
  {
    mode: 'text',
    match: '!>',
    handler: '≯',
  },
  {
    mode: 'text',
    match: '!<',
    handler: '≮',
  },
  {
    mode: 'text',
    match: '>=',
    handler: '≥',
  },
  {
    mode: 'text',
    match: '<=',
    handler: '≤',
  },
  {
    mode: 'text',
    match: '!>=',
    handler: '≱',
  },
  {
    mode: 'text',
    match: '!<=',
    handler: '≰',
  },
];
