/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 1, 2],
  another: [0, 2],
};
export const test = ({ path, another }) => PathApi.common(path, another);
export const output = [0];
