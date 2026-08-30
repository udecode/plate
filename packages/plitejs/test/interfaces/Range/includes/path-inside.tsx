/** @jsx jsx */

import { RangeApi } from 'plitejs';

export const input = {
  range: {
    kind: 'text',
    anchor: {
      path: [1],
      offset: 0,
    },
    focus: {
      path: [3],
      offset: 0,
    },
  },
  target: [2],
};
export const test = ({ range, target }) => RangeApi.includes(range, target);
export const output = true;
