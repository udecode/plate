/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [0, 1],
  another: [],
};
export const test = ({ path, another }) => PathApi.isChild(path, another);
export const output = false;
