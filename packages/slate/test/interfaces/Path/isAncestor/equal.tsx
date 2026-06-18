/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 1, 2],
  another: [0, 1, 2],
};
export const test = ({ path, another }) => PathApi.isAncestor(path, another);
export const output = false;
