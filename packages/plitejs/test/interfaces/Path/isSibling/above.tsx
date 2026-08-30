/** @jsx jsx */

import { PathApi } from 'plitejs';

export const input = {
  path: [],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.isSibling(path, another);
export const output = false;
