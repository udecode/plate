/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [0, 1, 2],
  another: [3, 2],
};
export const test = ({ path, another }) => PathApi.common(path, another);
export const output = [];
