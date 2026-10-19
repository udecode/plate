/** @jsx jsx */

import { RangeApi } from 'plitejs';

export const input = {
  kind: 'text',
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
