/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = [
  {
    children: [],
    selection: null,
  },
  'a string',
];
export const test = (value) => NodeApi.isNodeList(value);
export const output = false;
