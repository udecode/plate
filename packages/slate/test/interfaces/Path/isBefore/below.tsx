/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 1, 2],
  another: [0],
};
export const test = ({ path, another }) => PathApi.isBefore(path, another);
export const output = false;
