import type { AutoformatRule } from '../types';

export const autoformatLegal: AutoformatRule[] = [
  {
    format: '™',
    match: ['(tm)', '(TM)'],
    mode: 'text',
  },
  {
    format: '®',
    match: ['(r)', '(R)'],
    mode: 'text',
  },

  {
    format: '©',
    match: ['(c)', '(C)'],
    mode: 'text',
  },
];

export const autoformatLegalHtml: AutoformatRule[] = [
  {
    format: '™',
    match: '&trade;',
    mode: 'text',
  },
  {
    format: '®',
    match: '&reg;',
    mode: 'text',
  },
  {
    format: '©',
    match: '&copy;',
    mode: 'text',
  },
  {
    format: '§',
    match: '&sect;',
    mode: 'text',
  },
];
