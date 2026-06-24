/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [1, 1, 2],
  another: [0],
};
export const test = ({ path, another }) => PathApi.endsAt(path, another);
export const output = false;
