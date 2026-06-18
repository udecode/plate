/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 1, 2],
  another: [],
};
export const test = ({ path, another }) => PathApi.compare(path, another);
export const output = 0;
