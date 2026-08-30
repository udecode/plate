/** @jsx jsx */

import { NodeApi } from 'plitejs';

export const input = {
  children: [],
  selection: null,
};
export const test = (value) => NodeApi.isNode(value);
export const output = false;
