import { AutoformatRule } from '../types';

export const autoformatLegal: AutoformatRule[] = [
  {
    mode: 'text',
    match: ['(tm)', '(TM)'],
    format: '™',
  },
  {
    mode: 'text',
    match: ['(r)', '(R)'],
    format: '®',
  },

  {
    mode: 'text',
    match: ['(c)', '(C)'],
    format: '©',
  },
];

export const autoformatLegalHtml: AutoformatRule[] = [
  {
    mode: 'text',
    match: '&trade;',
    format: '™',
  },
  {
    mode: 'text',
    match: '&reg;',
    format: '®',
  },
  {
    mode: 'text',
    match: '&copy;',
    format: '©',
  },
  {
    mode: 'text',
    match: '&sect;',
    format: '§',
  },
];
