/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = [
  {
    children: [],
    selection: null,
  },
];
export const test = (value) => NodeApi.isNodeList(value);
export const output = true;
