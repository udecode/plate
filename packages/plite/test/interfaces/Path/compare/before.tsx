/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [0, 1, 2],
  another: [1],
};
export const test = ({ path, another }) => PathApi.compare(path, another);
export const output = -1;
