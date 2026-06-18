/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.compare(path, another);
export const output = 0;
