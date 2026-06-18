/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.equals(path, another);
export const output = false;
