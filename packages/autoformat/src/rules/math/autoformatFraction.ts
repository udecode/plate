import { AutoformatRule } from '../../types';

export const autoformatFraction: AutoformatRule[] = [
  {
    mode: 'text',
    match: '1/2',
    format: '½',
  },
  {
    mode: 'text',
    match: '1/3',
    format: '⅓',
  },
  {
    mode: 'text',
    match: '1/4',
    format: '¼',
  },
  {
    mode: 'text',
    match: '1/5',
    format: '⅕',
  },
  {
    mode: 'text',
    match: '1/6',
    format: '⅙',
  },
  {
    mode: 'text',
    match: '1/7',
    format: '⅐',
  },
  {
    mode: 'text',
    match: '1/8',
    format: '⅛',
  },
  {
    mode: 'text',
    match: '1/9',
    format: '⅑',
  },
  {
    mode: 'text',
    match: '1/10',
    format: '⅒',
  },
  {
    mode: 'text',
    match: '2/3',
    format: '⅔',
  },
  {
    mode: 'text',
    match: '2/5',
    format: '⅖',
  },
  {
    mode: 'text',
    match: '3/4',
    format: '¾',
  },
  {
    mode: 'text',
    match: '3/5',
    format: '⅗',
  },
  {
    mode: 'text',
    match: '3/8',
    format: '⅜',
  },
  {
    mode: 'text',
    match: '4/5',
    format: '⅘',
  },
  {
    mode: 'text',
    match: '5/6',
    format: '⅚',
  },
  {
    mode: 'text',
    match: '5/8',
    format: '⅝',
  },
  {
    mode: 'text',
    match: '7/8',
    format: '⅞',
  },
];
