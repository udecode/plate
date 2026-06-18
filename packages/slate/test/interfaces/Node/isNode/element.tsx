/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = {
  children: [],
};
export const test = (value) => NodeApi.isNode(value);
export const output = true;
