/** @jsx jsx */

import { PathApi } from 'plitejs';

export const input = {
  path: [0],
  another: [0, 1],
};
export const test = ({ path, another }) => PathApi.isChild(path, another);
export const output = false;
