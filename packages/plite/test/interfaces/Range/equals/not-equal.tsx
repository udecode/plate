/** @jsx jsx */

import { RangeApi } from '@platejs/plite';

export const input = {
  range: {
    kind: 'text',
    anchor: {
      path: [0, 4],
      offset: 7,
    },
    focus: {
      path: [0, 4],
      offset: 7,
    },
  },
  another: {
    kind: 'text',
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
export const output = false;
