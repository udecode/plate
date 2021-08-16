import { AutoformatRule } from '@udecode/plate';

export const autoformatLegal: AutoformatRule[] = [
  {
    mode: 'text',
    match: ['(tm)', '(TM)'],
    handler: '™',
  },
  {
    mode: 'text',
    match: ['(r)', '(R)'],
    handler: '®',
  },

  {
    mode: 'text',
    match: ['(c)', '(C)'],
    handler: '©',
  },
];

export const autoformatLegalHtml: AutoformatRule[] = [
  {
    mode: 'text',
    match: '&trade;',
    handler: '™',
  },
  {
    mode: 'text',
    match: '&reg;',
    handler: '®',
  },
  {
    mode: 'text',
    match: '&copy;',
    handler: '©',
  },
  {
    mode: 'text',
    match: '&sect;',
    handler: '§',
  },
];
