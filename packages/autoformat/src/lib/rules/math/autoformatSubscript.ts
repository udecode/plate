import type { AutoformatRule } from '../../types';

export const autoformatSubscriptNumbers: AutoformatRule[] = [
  {
    format: '₀',
    match: '~0',
    mode: 'text',
  },
  {
    format: '₁',
    match: '~1',
    mode: 'text',
  },
  {
    format: '₂',
    match: '~2',
    mode: 'text',
  },
  {
    format: '₃',
    match: '~3',
    mode: 'text',
  },
  {
    format: '₄',
    match: '~4',
    mode: 'text',
  },
  {
    format: '₅',
    match: '~5',
    mode: 'text',
  },
  {
    format: '₆',
    match: '~6',
    mode: 'text',
  },
  {
    format: '₇',
    match: '~7',
    mode: 'text',
  },
  {
    format: '₈',
    match: '~8',
    mode: 'text',
  },
  {
    format: '₉',
    match: '~9',
    mode: 'text',
  },
];

export const autoformatSubscriptSymbols: AutoformatRule[] = [
  {
    format: '₊',
    match: '~+',
    mode: 'text',
  },
  {
    format: '₋',
    match: '~-',
    mode: 'text',
  },
];
