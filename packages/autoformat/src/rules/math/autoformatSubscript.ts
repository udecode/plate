import { AutoformatRule } from '../../types';

export const autoformatSubscriptNumbers: AutoformatRule[] = [
  {
    mode: 'text',
    match: '~0',
    handler: '₀',
  },
  {
    mode: 'text',
    match: '~1',
    handler: '₁',
  },
  {
    mode: 'text',
    match: '~2',
    handler: '₂',
  },
  {
    mode: 'text',
    match: '~3',
    handler: '₃',
  },
  {
    mode: 'text',
    match: '~4',
    handler: '₄',
  },
  {
    mode: 'text',
    match: '~5',
    handler: '₅',
  },
  {
    mode: 'text',
    match: '~6',
    handler: '₆',
  },
  {
    mode: 'text',
    match: '~7',
    handler: '₇',
  },
  {
    mode: 'text',
    match: '~8',
    handler: '₈',
  },
  {
    mode: 'text',
    match: '~9',
    handler: '₉',
  },
];

export const autoformatSubscriptSymbols: AutoformatRule[] = [
  {
    mode: 'text',
    match: '~+',
    handler: '₊',
  },
  {
    mode: 'text',
    match: '~-',
    handler: '₋',
  },
];
