/** @jsx jsx */

import { RangeApi } from '@platejs/plite';

export const input = {
  anchor: {
    path: [0],
    offset: 0,
  },
  focus: {
    path: [3],
    offset: 0,
  },
};
export const test = (range) => RangeApi.isExpanded(range);
export const output = true;
