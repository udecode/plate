/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = [
  {
    text: '',
  },
];
export const test = (value) => NodeApi.isNodeList(value);
export const output = true;
