/** @jsx jsx */

import { PointApi } from '@platejs/plite';

export const input = {
  point: {
    path: [0, 4],
    offset: 7,
  },
  another: {
    path: [0, 1],
    offset: 3,
  },
};
export const test = ({ point, another }) => PointApi.isBefore(point, another);
export const output = false;
