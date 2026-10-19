/** @jsx jsx */

import { RangeApi } from 'plitejs';

export const input = {
  kind: 'text',
  anchor: {
    path: [0],
    offset: 0,
  },
  focus: {
    path: [0],
    offset: 0,
  },
};
export const test = (range) => RangeApi.isCollapsed(range);
export const output = true;
