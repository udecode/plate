/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [1, 1, 2],
  another: [0],
};
export const test = ({ path, another }) => PathApi.compare(path, another);
export const output = 1;
