/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = {
  path: [0],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.endsAfter(path, another);
export const output = false;
