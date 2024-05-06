import type { AutoformatRule } from '../../types';

export const autoformatSuperscriptNumbers: AutoformatRule[] = [
  {
    format: '⁰',
    match: '^0',
    mode: 'text',
  },
  {
    format: '¹',
    match: '^1',
    mode: 'text',
  },
  {
    format: '²',
    match: '^2',
    mode: 'text',
  },
  {
    format: '³',
    match: '^3',
    mode: 'text',
  },
  {
    format: '⁴',
    match: '^4',
    mode: 'text',
  },
  {
    format: '⁵',
    match: '^5',
    mode: 'text',
  },
  {
    format: '⁶',
    match: '^6',
    mode: 'text',
  },
  {
    format: '⁷',
    match: '^7',
    mode: 'text',
  },
  {
    format: '⁸',
    match: '^8',
    mode: 'text',
  },
  {
    format: '⁹',
    match: '^9',
    mode: 'text',
  },
];

export const autoformatSuperscriptSymbols: AutoformatRule[] = [
  {
    format: '°',
    match: '^o',
    mode: 'text',
  },
  {
    format: '⁺',
    match: '^+',
    mode: 'text',
  },
  {
    format: '⁻',
    match: '^-',
    mode: 'text',
  },
];
