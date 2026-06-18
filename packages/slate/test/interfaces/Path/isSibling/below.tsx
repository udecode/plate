/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 2],
  another: [0],
};
export const test = ({ path, another }) => PathApi.isSibling(path, another);
export const output = false;
