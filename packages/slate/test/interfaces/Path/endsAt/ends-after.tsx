/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = {
  path: [1],
  another: [0, 2],
};
export const test = ({ path, another }) => PathApi.endsAt(path, another);
export const output = false;
