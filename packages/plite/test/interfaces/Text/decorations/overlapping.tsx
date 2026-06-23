/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = [
  {
    anchor: {
      path: [0],
      offset: 1,
    },
    focus: {
      path: [0],
      offset: 2,
    },
    decoration1: 'decoration1',
  },
  {
    anchor: {
      path: [0],
      offset: 0,
    },
    focus: {
      path: [0],
      offset: 3,
    },
    decoration2: 'decoration2',
  },
];
export const test = (decorations) =>
  TextApi.decorations({ text: 'abc', mark: 'mark' }, decorations);
export const output = [
  {
    leaf: {
      text: 'a',
      mark: 'mark',
      decoration2: 'decoration2',
    },
    position: { start: 0, end: 1, isFirst: true },
  },
  {
    leaf: {
      text: 'b',
      mark: 'mark',
      decoration1: 'decoration1',
      decoration2: 'decoration2',
    },
    position: { start: 1, end: 2 },
  },
  {
    leaf: {
      text: 'c',
      mark: 'mark',
      decoration2: 'decoration2',
    },
    position: { start: 2, end: 3, isLast: true },
  },
];
