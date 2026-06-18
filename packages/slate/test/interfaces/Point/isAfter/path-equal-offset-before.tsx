/** @jsx jsx */

import { PointApi } from '@platejs/slate';

export const input = {
  point: {
    path: [0, 1],
    offset: 0,
  },
  another: {
    path: [0, 1],
    offset: 3,
  },
};
export const test = ({ point, another }) => PointApi.isAfter(point, another);
export const output = false;
