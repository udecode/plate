/** @jsx jsx */

import { RangeApi } from 'plitejs';

export const input = {
  anchor: {
    path: [0, 1],
    offset: 0,
  },
};
export const test = (value) => RangeApi.isRange(value);
export const output = false;
