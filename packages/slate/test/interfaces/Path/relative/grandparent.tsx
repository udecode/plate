/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 1, 2],
  another: [0],
};
export const test = ({ path, another }) => PathApi.relative(path, another);
export const output = [1, 2];
