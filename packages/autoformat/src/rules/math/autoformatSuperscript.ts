import { AutoformatRule } from '../../types';

export const autoformatSuperscriptNumbers: AutoformatRule[] = [
  {
    mode: 'text',
    match: '^0',
    format: '⁰',
  },
  {
    mode: 'text',
    match: '^1',
    format: '¹',
  },
  {
    mode: 'text',
    match: '^2',
    format: '²',
  },
  {
    mode: 'text',
    match: '^3',
    format: '³',
  },
  {
    mode: 'text',
    match: '^4',
    format: '⁴',
  },
  {
    mode: 'text',
    match: '^5',
    format: '⁵',
  },
  {
    mode: 'text',
    match: '^6',
    format: '⁶',
  },
  {
    mode: 'text',
    match: '^7',
    format: '⁷',
  },
  {
    mode: 'text',
    match: '^8',
    format: '⁸',
  },
  {
    mode: 'text',
    match: '^9',
    format: '⁹',
  },
];

export const autoformatSuperscriptSymbols: AutoformatRule[] = [
  {
    mode: 'text',
    match: '^o',
    format: '°',
  },
  {
    mode: 'text',
    match: '^+',
    format: '⁺',
  },
  {
    mode: 'text',
    match: '^-',
    format: '⁻',
  },
];
