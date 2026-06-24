/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.isParent(path, another);
export const output = false;
