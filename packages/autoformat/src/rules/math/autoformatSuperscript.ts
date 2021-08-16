import { AutoformatRule } from '../../types';

export const autoformatSuperscriptNumbers: AutoformatRule[] = [
  {
    mode: 'text',
    match: '^0',
    handler: '⁰',
  },
  {
    mode: 'text',
    match: '^1',
    handler: '¹',
  },
  {
    mode: 'text',
    match: '^2',
    handler: '²',
  },
  {
    mode: 'text',
    match: '^3',
    handler: '³',
  },
  {
    mode: 'text',
    match: '^4',
    handler: '⁴',
  },
  {
    mode: 'text',
    match: '^5',
    handler: '⁵',
  },
  {
    mode: 'text',
    match: '^6',
    handler: '⁶',
  },
  {
    mode: 'text',
    match: '^7',
    handler: '⁷',
  },
  {
    mode: 'text',
    match: '^8',
    handler: '⁸',
  },
  {
    mode: 'text',
    match: '^9',
    handler: '⁹',
  },
];

export const autoformatSuperscriptSymbols: AutoformatRule[] = [
  {
    mode: 'text',
    match: '^o',
    handler: '°',
  },
  {
    mode: 'text',
    match: '^+',
    handler: '⁺',
  },
  {
    mode: 'text',
    match: '^-',
    handler: '⁻',
  },
];
