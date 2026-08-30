/** @jsx jsx */

import { RangeApi } from 'plitejs';

export const input = {
  range: {
    kind: 'text',
    anchor: {
      path: [1],
      offset: 3,
    },
    focus: {
      path: [3],
      offset: 0,
    },
  },
  target: {
    path: [1],
    offset: 0,
  },
};
export const test = ({ range, target }) => RangeApi.includes(range, target);
export const output = false;
