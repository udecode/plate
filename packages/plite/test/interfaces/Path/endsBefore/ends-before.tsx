/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [0],
  another: [1, 2],
};
export const test = ({ path, another }) => PathApi.endsBefore(path, another);
export const output = true;
