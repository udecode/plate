/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [0, 1],
  another: [],
};
export const test = ({ path, another }) => PathApi.isDescendant(path, another);
export const output = true;
