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
    decoration: 'decoration',
  },
];
export const test = (decorations) =>
  TextApi.decorations({ text: 'abc', mark: 'mark' }, decorations);
export const output = [
  {
    leaf: {
      text: 'a',
      mark: 'mark',
    },
    position: { start: 0, end: 1, isFirst: true },
  },
  {
    leaf: {
      text: 'b',
      mark: 'mark',
      decoration: 'decoration',
    },
    position: { start: 1, end: 2 },
  },
  {
    leaf: {
      text: 'c',
      mark: 'mark',
    },
    position: { start: 2, end: 3, isLast: true },
  },
];
