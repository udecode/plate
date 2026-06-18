/** @jsx jsx */

import { PointApi } from '@platejs/slate';

export const input = {
  point: {
    path: [0, 1],
    offset: 7,
  },
  another: {
    path: [0, 1],
    offset: 7,
  },
};
export const test = ({ point, another }) => PointApi.isBefore(point, another);
export const output = false;
