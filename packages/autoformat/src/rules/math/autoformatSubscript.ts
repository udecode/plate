import { AutoformatRule } from '../../types';

export const autoformatSubscriptNumbers: AutoformatRule[] = [
  {
    mode: 'text',
    match: '~0',
    format: '₀',
  },
  {
    mode: 'text',
    match: '~1',
    format: '₁',
  },
  {
    mode: 'text',
    match: '~2',
    format: '₂',
  },
  {
    mode: 'text',
    match: '~3',
    format: '₃',
  },
  {
    mode: 'text',
    match: '~4',
    format: '₄',
  },
  {
    mode: 'text',
    match: '~5',
    format: '₅',
  },
  {
    mode: 'text',
    match: '~6',
    format: '₆',
  },
  {
    mode: 'text',
    match: '~7',
    format: '₇',
  },
  {
    mode: 'text',
    match: '~8',
    format: '₈',
  },
  {
    mode: 'text',
    match: '~9',
    format: '₉',
  },
];

export const autoformatSubscriptSymbols: AutoformatRule[] = [
  {
    mode: 'text',
    match: '~+',
    format: '₊',
  },
  {
    mode: 'text',
    match: '~-',
    format: '₋',
  },
];
