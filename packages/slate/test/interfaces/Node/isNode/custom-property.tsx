/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = {
  children: [],
  custom: true,
};
export const test = (value) => NodeApi.isNode(value);
export const output = true;
