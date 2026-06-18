/** @jsx jsx */

import { RangeApi } from '@platejs/slate';

export const input = {
  focus: {
    path: [0, 1],
    offset: 0,
  },
};
export const test = (value) => RangeApi.isRange(value);
export const output = false;
