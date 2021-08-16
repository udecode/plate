import { AutoformatRule } from '../../types';

export const autoformatFraction: AutoformatRule[] = [
  {
    mode: 'text',
    match: '1/2',
    handler: '½',
  },
  {
    mode: 'text',
    match: '1/3',
    handler: '⅓',
  },
  {
    mode: 'text',
    match: '1/4',
    handler: '¼',
  },
  {
    mode: 'text',
    match: '1/5',
    handler: '⅕',
  },
  {
    mode: 'text',
    match: '1/6',
    handler: '⅙',
  },
  {
    mode: 'text',
    match: '1/7',
    handler: '⅐',
  },
  {
    mode: 'text',
    match: '1/8',
    handler: '⅛',
  },
  {
    mode: 'text',
    match: '1/9',
    handler: '⅑',
  },
  {
    mode: 'text',
    match: '1/10',
    handler: '⅒',
  },
  {
    mode: 'text',
    match: '2/3',
    handler: '⅔',
  },
  {
    mode: 'text',
    match: '2/5',
    handler: '⅖',
  },
  {
    mode: 'text',
    match: '3/4',
    handler: '¾',
  },
  {
    mode: 'text',
    match: '3/5',
    handler: '⅗',
  },
  {
    mode: 'text',
    match: '3/8',
    handler: '⅜',
  },
  {
    mode: 'text',
    match: '4/5',
    handler: '⅘',
  },
  {
    mode: 'text',
    match: '5/6',
    handler: '⅚',
  },
  {
    mode: 'text',
    match: '5/8',
    handler: '⅝',
  },
  {
    mode: 'text',
    match: '7/8',
    handler: '⅞',
  },
];
