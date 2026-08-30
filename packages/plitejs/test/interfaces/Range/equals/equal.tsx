/** @jsx jsx */

import { RangeApi } from 'plitejs';

export const input = {
  range: {
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
export const output = true;
