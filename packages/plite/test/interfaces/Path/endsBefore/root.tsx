/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [0, 1, 2],
  another: [],
};
export const test = ({ path, another }) => PathApi.endsBefore(path, another);
export const output = false;
