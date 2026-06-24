/** @jsx jsx */

import { RangeApi } from '@platejs/plite';

export const input = {
  range: {
    anchor: {
      path: [0, 1],
      offset: 0,
    },
    focus: {
      path: [0, 1],
      offset: 0,
    },
  },
  another: {
    anchor: {
      path: [0, 1],
      offset: 0,
    },
    focus: {
      path: [0, 1],
      offset: 0,
    },
  },
};
export const test = ({ range, another }) => RangeApi.equals(range, another);
export const output = true;
