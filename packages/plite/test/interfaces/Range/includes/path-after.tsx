/** @jsx jsx */

import { RangeApi } from '@platejs/plite';

export const input = {
  range: {
    anchor: {
      path: [1],
      offset: 0,
    },
    focus: {
      path: [3],
      offset: 0,
    },
  },
  target: [4],
};
export const test = ({ range, target }) => RangeApi.includes(range, target);
export const output = false;
