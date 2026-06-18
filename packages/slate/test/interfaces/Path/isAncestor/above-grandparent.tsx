/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.isAncestor(path, another);
export const output = true;
